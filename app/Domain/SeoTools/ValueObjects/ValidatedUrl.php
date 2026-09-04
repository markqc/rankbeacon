<?php

declare(strict_types=1);

namespace App\Domain\SeoTools\ValueObjects;

readonly class ValidatedUrl
{
    public function __construct(
        public string $normalizedUrl,
        public string $scheme,
        public string $host,
        public int $port,
        public string $ip,
        public ?string $path = null,
    ) {}
}
