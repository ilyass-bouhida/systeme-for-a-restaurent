<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TableResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'capacity' => $this->capacity,
            'status' => $this->status->value,
            'is_active' => $this->is_active,
            'display_order' => $this->display_order,
            'active_order' => $this->whenLoaded('activeOrder', fn () => $this->activeOrder ? [
                'id' => $this->activeOrder->id,
                'public_id' => $this->activeOrder->public_id,
                'status' => $this->activeOrder->status->value,
                'total_cents' => $this->activeOrder->total_cents,
                'worker' => $this->activeOrder->relationLoaded('worker')
                    ? $this->activeOrder->worker?->only(['id', 'name'])
                    : null,
            ] : null),
        ];
    }
}
