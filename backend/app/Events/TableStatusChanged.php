<?php

namespace App\Events;

use App\Models\RestaurantTable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TableStatusChanged implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly RestaurantTable $table,
        public readonly ?int $orderId = null,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('restaurant.operations')];
    }

    public function broadcastAs(): string
    {
        return 'table.status.changed';
    }

    /**
     * @return array<string, int|string|null>
     */
    public function broadcastWith(): array
    {
        return [
            'table_id' => $this->table->id,
            'status' => $this->table->status->value,
            'order_id' => $this->orderId,
        ];
    }
}
