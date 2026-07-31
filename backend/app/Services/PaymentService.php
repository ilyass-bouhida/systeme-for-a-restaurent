<?php

namespace App\Services;

use App\Contracts\CardTerminal;
use App\Contracts\CashDrawer;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\TableStatus;
use App\Events\PaymentCompleted;
use App\Events\TableStatusChanged;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class PaymentService
{
    public function __construct(
        private readonly ReceiptService $receipts,
        private readonly CashDrawer $cashDrawer,
        private readonly CardTerminal $cardTerminal,
        private readonly ActivityService $activity,
    ) {}

    public function complete(
        Order $order,
        User $worker,
        PaymentMethod $method,
        ?int $paidCents,
    ): Receipt {
        $receipt = DB::transaction(function () use ($order, $worker, $method, $paidCents): Receipt {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()
                ->with(['items', 'restaurantTable'])
                ->lockForUpdate()
                ->findOrFail($order->id);

            if ($lockedOrder->status === OrderStatus::Paid) {
                return $lockedOrder->payment()->with('receipt')->firstOrFail()->receipt;
            }

            if (! in_array($lockedOrder->status, [OrderStatus::Open, OrderStatus::Held], true)) {
                throw ValidationException::withMessages([
                    'order' => 'This order cannot be paid.',
                ]);
            }

            if ($lockedOrder->items->isEmpty() || $lockedOrder->total_cents < 1) {
                throw ValidationException::withMessages([
                    'order' => 'An empty order cannot be paid.',
                ]);
            }

            $amountPaid = $method === PaymentMethod::Card
                ? $lockedOrder->total_cents
                : (int) $paidCents;

            if ($amountPaid < $lockedOrder->total_cents) {
                throw ValidationException::withMessages([
                    'paid_cents' => 'The amount paid is lower than the order total.',
                ]);
            }

            $terminalReference = $method === PaymentMethod::Card
                ? $this->cardTerminal->charge($lockedOrder, $lockedOrder->total_cents)
                : null;

            $payment = Payment::query()->create([
                'order_id' => $lockedOrder->id,
                'processed_by' => $worker->id,
                'method' => $method,
                'total_cents' => $lockedOrder->total_cents,
                'paid_cents' => $amountPaid,
                'change_cents' => $method === PaymentMethod::Cash
                    ? $amountPaid - $lockedOrder->total_cents
                    : 0,
                'terminal_reference' => $terminalReference,
                'completed_at' => now(),
            ]);

            $lockedOrder->update([
                'status' => OrderStatus::Paid,
                'paid_at' => now(),
            ]);
            $lockedOrder->restaurantTable()->update(['status' => TableStatus::Available]);

            $this->activity->record($worker, 'payment.completed', $payment, [
                'method' => $method->value,
                'total_cents' => $lockedOrder->total_cents,
            ]);

            return $this->receipts->createFor($payment);
        });

        $receipt->loadMissing(['payment.order.restaurantTable']);
        PaymentCompleted::dispatch($receipt->payment);
        TableStatusChanged::dispatch(
            $receipt->payment->order->restaurantTable,
            $receipt->payment->order_id,
        );

        $this->attemptHardwareActions($receipt);

        return $receipt->fresh(['payment.order.items', 'payment.order.restaurantTable']);
    }

    private function attemptHardwareActions(Receipt $receipt): void
    {
        try {
            $this->receipts->print($receipt);
        } catch (Throwable $exception) {
            Log::error('Receipt printing failed.', [
                'receipt_id' => $receipt->id,
                'message' => $exception->getMessage(),
            ]);
        }

        if ($receipt->payment->method !== PaymentMethod::Cash) {
            return;
        }

        try {
            $this->cashDrawer->open($receipt->payment);
        } catch (Throwable $exception) {
            Log::error('Cash drawer operation failed.', [
                'payment_id' => $receipt->payment_id,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
