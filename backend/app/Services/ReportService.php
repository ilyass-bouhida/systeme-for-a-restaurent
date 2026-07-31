<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\ActivityLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\RestaurantTable;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class ReportService
{
    /**
     * @return array<string, mixed>
     */
    public function dashboard(): array
    {
        $periodSummaries = [
            'day' => $this->summaryFrom($this->startForPeriod('day')),
            'week' => $this->summaryFrom($this->startForPeriod('week')),
            'month' => $this->summaryFrom($this->startForPeriod('month')),
            'year' => $this->summaryFrom($this->startForPeriod('year')),
        ];
        $today = $periodSummaries['day'];

        $paymentMethods = Payment::query()
            ->where('completed_at', '>=', $this->startForPeriod('day'))
            ->selectRaw('method, SUM(total_cents) as revenue_cents, COUNT(*) as orders')
            ->groupBy('method')
            ->get()
            ->map(fn (Payment $payment) => [
                'method' => $payment->method->value,
                'revenue_cents' => (int) $payment->getAttribute('revenue_cents'),
                'orders' => (int) $payment->getAttribute('orders'),
            ])
            ->values();

        return [
            'revenue_today_cents' => $today['revenue_cents'],
            'cost_today_cents' => $today['cost_cents'],
            'profit_today_cents' => $today['profit_cents'],
            'profit_margin_today' => $today['profit_margin_percentage'],
            'visitors_today' => $today['visitors'],
            'average_ticket_today_cents' => $today['average_ticket_cents'],
            'paid_orders_today' => $today['orders'],
            'items_sold_today' => (int) OrderItem::query()
                ->whereHas('order.payment', fn ($query) => $query
                    ->where('completed_at', '>=', $this->startForPeriod('day')))
                ->sum('quantity'),
            'open_orders' => Order::query()
                ->whereIn('status', [OrderStatus::Open->value, OrderStatus::Held->value])
                ->count(),
            'guests_in_service' => (int) Order::query()
                ->whereIn('status', [OrderStatus::Open->value, OrderStatus::Held->value])
                ->sum('guest_count'),
            'active_workers' => User::query()
                ->role('worker')
                ->where('is_active', true)
                ->count(),
            'period_summaries' => $periodSummaries,
            'payment_methods_today' => $paymentMethods,
            'tables' => RestaurantTable::query()
                ->where('is_active', true)
                ->orderBy('display_order')
                ->get(),
            'recent_activity' => ActivityLog::query()
                ->with('actor:id,name')
                ->latest('created_at')
                ->limit(12)
                ->get(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function report(string $period): array
    {
        $start = $this->startForPeriod($period);
        $bucketFormat = match ($period) {
            'day' => 'H:00',
            'week' => 'D',
            'month' => 'd M',
            'year' => 'M',
        };

        $payments = Payment::query()
            ->with([
                'order.worker:id,name',
                'order.restaurantTable:id,label',
                'order.items:id,order_id,quantity,line_total_cents,line_cost_cents',
            ])
            ->where('completed_at', '>=', $start)
            ->orderBy('completed_at')
            ->get();

        $summary = $this->summarizePayments($payments);

        $topProducts = OrderItem::query()
            ->selectRaw(
                'product_name, SUM(quantity) as quantity, '.
                'SUM(line_total_cents) as revenue_cents, '.
                'SUM(line_cost_cents) as cost_cents, '.
                'SUM(line_total_cents - line_cost_cents) as profit_cents',
            )
            ->whereHas('order.payment', fn ($query) => $query->where('completed_at', '>=', $start))
            ->groupBy('product_name')
            ->orderByDesc('quantity')
            ->limit(10)
            ->get();

        $paymentMethods = $payments
            ->groupBy(fn (Payment $payment) => $payment->method->value)
            ->map(fn (Collection $bucket, string $method) => [
                'method' => $method,
                'revenue_cents' => (int) $bucket->sum('total_cents'),
                'orders' => $bucket->count(),
            ])
            ->values()
            ->all();

        return [
            'period' => $period,
            'from' => $start->toIso8601String(),
            'total_revenue_cents' => $summary['revenue_cents'],
            'total_cost_cents' => $summary['cost_cents'],
            'gross_profit_cents' => $summary['profit_cents'],
            'gross_margin_percentage' => $summary['profit_margin_percentage'],
            'orders_count' => $summary['orders'],
            'visitors_count' => $summary['visitors'],
            'items_sold' => $summary['items_sold'],
            'average_ticket_cents' => $summary['average_ticket_cents'],
            'average_spend_per_visitor_cents' => $summary['average_spend_per_visitor_cents'],
            'series' => $this->series($payments, $bucketFormat),
            'payment_methods' => $paymentMethods,
            'workers' => $this->groupPayments($payments, 'order.worker.name'),
            'tables' => $this->groupPayments($payments, 'order.restaurantTable.label'),
            'top_products' => $topProducts,
        ];
    }

    /**
     * @return array<string, int>
     */
    public function workerToday(User $worker): array
    {
        $today = CarbonImmutable::today();
        $payments = Payment::query()
            ->where('processed_by', $worker->id)
            ->where('completed_at', '>=', $today);

        return [
            'total_collected_cents' => (int) (clone $payments)->sum('total_cents'),
            'paid_tables' => (clone $payments)->distinct('order_id')->count('order_id'),
            'orders_handled' => Order::query()
                ->where('worker_id', $worker->id)
                ->where('created_at', '>=', $today)
                ->count(),
        ];
    }

    private function startForPeriod(string $period): CarbonImmutable
    {
        return match ($period) {
            'day' => CarbonImmutable::now()->startOfDay(),
            'week' => CarbonImmutable::now()->startOfWeek(),
            'month' => CarbonImmutable::now()->startOfMonth(),
            'year' => CarbonImmutable::now()->startOfYear(),
            default => throw new \InvalidArgumentException('Unsupported report period.'),
        };
    }

    /**
     * @return array<string, int|float>
     */
    private function summaryFrom(CarbonImmutable $start): array
    {
        $row = Payment::query()
            ->join('orders', 'orders.id', '=', 'payments.order_id')
            ->where('payments.completed_at', '>=', $start)
            ->selectRaw(
                'COUNT(payments.id) as orders_count, '.
                'COALESCE(SUM(payments.total_cents), 0) as revenue_cents, '.
                'COALESCE(SUM(orders.cost_total_cents), 0) as cost_cents, '.
                'COALESCE(SUM(orders.guest_count), 0) as visitors',
            )
            ->first();

        $revenue = (int) $row->getAttribute('revenue_cents');
        $cost = (int) $row->getAttribute('cost_cents');
        $orders = (int) $row->getAttribute('orders_count');
        $visitors = (int) $row->getAttribute('visitors');

        return [
            'revenue_cents' => $revenue,
            'cost_cents' => $cost,
            'profit_cents' => $revenue - $cost,
            'profit_margin_percentage' => $this->percentage($revenue - $cost, $revenue),
            'orders' => $orders,
            'visitors' => $visitors,
            'average_ticket_cents' => $orders > 0 ? (int) round($revenue / $orders) : 0,
            'average_spend_per_visitor_cents' => $visitors > 0
                ? (int) round($revenue / $visitors)
                : 0,
        ];
    }

    /**
     * @param  Collection<int, Payment>  $payments
     * @return array<string, int|float>
     */
    private function summarizePayments(Collection $payments): array
    {
        $revenue = (int) $payments->sum('total_cents');
        $cost = (int) $payments->sum(fn (Payment $payment) => $payment->order->cost_total_cents);
        $orders = $payments->count();
        $visitors = (int) $payments->sum(fn (Payment $payment) => $payment->order->guest_count);

        return [
            'revenue_cents' => $revenue,
            'cost_cents' => $cost,
            'profit_cents' => $revenue - $cost,
            'profit_margin_percentage' => $this->percentage($revenue - $cost, $revenue),
            'orders' => $orders,
            'visitors' => $visitors,
            'items_sold' => (int) $payments->sum(
                fn (Payment $payment) => $payment->order->items->sum('quantity'),
            ),
            'average_ticket_cents' => $orders > 0 ? (int) round($revenue / $orders) : 0,
            'average_spend_per_visitor_cents' => $visitors > 0
                ? (int) round($revenue / $visitors)
                : 0,
        ];
    }

    /**
     * @param  Collection<int, Payment>  $payments
     * @return list<array<string, int|string>>
     */
    private function series(Collection $payments, string $format): array
    {
        return $payments
            ->groupBy(fn (Payment $payment) => $payment->completed_at->format($format))
            ->map(function (Collection $bucket, string $label): array {
                $summary = $this->summarizePayments($bucket);

                return [
                    'label' => $label,
                    'revenue_cents' => $summary['revenue_cents'],
                    'cost_cents' => $summary['cost_cents'],
                    'profit_cents' => $summary['profit_cents'],
                    'orders' => $summary['orders'],
                    'visitors' => $summary['visitors'],
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Payment>  $payments
     * @return list<array<string, int|string>>
     */
    private function groupPayments(Collection $payments, string $key): array
    {
        return $payments
            ->groupBy(fn (Payment $payment) => (string) data_get($payment, $key, 'Unknown'))
            ->map(function (Collection $bucket, string $label): array {
                $summary = $this->summarizePayments($bucket);

                return [
                    'label' => $label,
                    'revenue_cents' => $summary['revenue_cents'],
                    'cost_cents' => $summary['cost_cents'],
                    'profit_cents' => $summary['profit_cents'],
                    'orders' => $summary['orders'],
                    'visitors' => $summary['visitors'],
                ];
            })
            ->sortByDesc('revenue_cents')
            ->values()
            ->all();
    }

    private function percentage(int $value, int $total): float
    {
        return $total > 0 ? round(($value / $total) * 100, 1) : 0.0;
    }
}
