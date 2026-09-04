<?php

declare(strict_types=1);

namespace App\Domain\SeoTools\Services\Contracts;

interface DnsResolverInterface
{
    /**
     * Resolve a hostname to one or more IP addresses.
     *
     * @return list<string>
     */
    public function resolve(string $host): array;
}
