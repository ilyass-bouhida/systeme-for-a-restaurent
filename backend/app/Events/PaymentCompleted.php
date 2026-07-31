<?php

namespace App\Events;

use App\Models\Payment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentCompleted implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Payment $payment) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('restaurant.operations')];
    }

    public function broadcastAs(): string
    {
        return 'payment.completed';
    }

    /**
     * @return array<string, int|string>
     */
    public function broadcastWith(): array
    {
        return [
            'payment_id' => $this->payment->id,
            'order_id' => $this->payment->order_id,
            'method' => $this->payment->method->value,
            'total_cents' => $this->payment->total_cents,
            'cost_cents' => $this->payment->order->cost_total_cents,
            'profit_cents' => $this->payment->total_cents
                - $this->payment->order->cost_total_cents,
            'guest_count' => $this->payment->order->guest_count,
        ];
    }
}
