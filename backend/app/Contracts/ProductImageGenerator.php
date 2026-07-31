<?php

namespace App\Contracts;

interface ProductImageGenerator
{
    public function generate(string $prompt): string;
}
