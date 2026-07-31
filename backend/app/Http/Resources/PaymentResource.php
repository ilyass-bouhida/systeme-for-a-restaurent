<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'method' => $this->method->value,
            'total_cents' => $this->total_cents,
            'paid_cents' => $this->paid_cents,
            'change_cents' => $this->change_cents,
            'terminal_reference' => $this->terminal_reference,
            'completed_at' => $this->completed_at->toIso8601String(),
            'receipt' => new ReceiptResource($this->whenLoaded('receipt')),
        ];
    }
}
