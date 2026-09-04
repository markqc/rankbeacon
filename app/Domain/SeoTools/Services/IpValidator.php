<?php

declare(strict_types=1);

namespace App\Domain\SeoTools\Services;

use Symfony\Component\HttpFoundation\IpUtils;

class IpValidator
{
    /**
     * @var string[]
     */
    private const PRIVATE_IPV4_CIDRS = [
        '0.0.0.0/8',
        '10.0.0.0/8',
        '100.64.0.0/10',
        '127.0.0.0/8',
        '169.254.0.0/16',
        '172.16.0.0/12',
        '192.0.0.0/24',
        '192.0.2.0/24',
        '192.88.99.0/24',
        '192.168.0.0/16',
        '198.18.0.0/15',
        '198.51.100.0/24',
        '203.0.113.0/24',
        '224.0.0.0/4',
        '240.0.0.0/4',
        '255.255.255.255/32',
    ];

    /**
     * @var string[]
     */
    private const PRIVATE_IPV6_CIDRS = [
        '::1/128',
        '::/128',
        '64:ff9b::/96',
        '2001:db8::/32',
        'fc00::/7',
        'fe80::/10',
        'ff00::/8',
    ];

    public function isPublicIp(string $ip): bool
    {
        return ! $this->isPrivateIp($ip);
    }

    public function isPrivateIp(string $ip): bool
    {
        if (filter_var($ip, FILTER_VALIDATE_IP) === false) {
            return true;
        }

        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false) {
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                return true;
            }

            foreach (self::PRIVATE_IPV4_CIDRS as $cidr) {
                if (IpUtils::checkIp($ip, $cidr)) {
                    return true;
                }
            }

            return false;
        }

        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) !== false) {
            foreach (self::PRIVATE_IPV6_CIDRS as $cidr) {
                if (IpUtils::checkIp($ip, $cidr)) {
                    return true;
                }
            }

            if (str_starts_with($ip, '::ffff:')) {
                $segments = explode(':', $ip);
                $mappedIpv4 = array_pop($segments);
                if ($mappedIpv4 !== null && $mappedIpv4 !== '' && $this->isPrivateIp($mappedIpv4)) {
                    return true;
                }
            }

            return false;
        }

        return true;
    }
}
