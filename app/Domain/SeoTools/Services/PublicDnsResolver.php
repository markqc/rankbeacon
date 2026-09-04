<?php

declare(strict_types=1);

namespace App\Domain\SeoTools\Services;

use App\Domain\SeoTools\Services\Contracts\DnsResolverInterface;

class PublicDnsResolver implements DnsResolverInterface
{
    public function resolve(string $host): array
    {
        $records = @dns_get_record($host, DNS_A | DNS_AAAA);

        if (is_array($records) && $records !== []) {
            $ips = [];

            foreach ($records as $record) {
                if (isset($record['ip'])) {
                    $ips[] = $record['ip'];
                } elseif (isset($record['ipv6'])) {
                    $ips[] = $record['ipv6'];
                }
            }

            return array_values(array_unique($ips));
        }

        // Fallback to system resolver, which follows CNAMEs and uses local cache.
        $ips = [];
        $ipv4s = @gethostbynamel($host);

        if ($ipv4s !== false && $ipv4s !== []) {
            $ips = array_values($ipv4s);
        }

        $first = @gethostbyname($host);

        if ($first !== '' && $first !== $host && ! in_array($first, $ips, true)) {
            $ips[] = $first;
        }

        return $ips;
    }
}
