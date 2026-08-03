<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'status' => $this->status->value,
            'guest_count' => $this->guest_count,
            'subtotal_cents' => $this->subtotal_cents,
            'total_cents' => $this->total_cents,
            'notes' => $this->notes,
            'held_at' => $this->held_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'table' => $this->whenLoaded('restaurantTable', fn () => [
                'id' => $this->restaurantTable->id,
                'label' => $this->restaurantTable->label,
                'status' => $this->restaurantTable->status->value,
            ]),
            'worker' => $this->whenLoaded('worker', fn () => [
                'id' => $this->worker->id,
                'name' => $this->worker->name,
            ]),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
        ];
    }
}
