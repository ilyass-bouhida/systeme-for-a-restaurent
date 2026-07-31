<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceiptResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'payload' => $this->payload,
            'last_printed_at' => $this->last_printed_at?->toIso8601String(),
            'print_count' => $this->print_count,
        ];
    }
}
