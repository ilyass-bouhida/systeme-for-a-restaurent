<?php

namespace App\Infrastructure\Images;

use App\Contracts\ProductImageGenerator;
use RuntimeException;

class DisabledProductImageGenerator implements ProductImageGenerator
{
    public function generate(string $prompt): string
    {
        throw new RuntimeException(
            'Product image generation is not configured. Bind a backend provider and set its server-side credentials.',
        );
    }
}
