<?php

declare(strict_types=1);

namespace App\Domain\SeoTools\Services;

use App\Domain\SeoTools\Exceptions\UnsafeUrlException;
use App\Domain\SeoTools\Services\Contracts\DnsResolverInterface;
use App\Domain\SeoTools\ValueObjects\ValidatedUrl;

class UrlSecurityValidator
{
    public function __construct(
        private readonly IpValidator $ipValidator,
        private readonly DnsResolverInterface $dnsResolver,
    ) {}

    public function validate(string $url): ValidatedUrl
    {
        $url = trim($url);

        if ($url === '') {
            throw new UnsafeUrlException('URL is required.', 'MISSING_URL');
        }

        if (strlen($url) > 2048) {
            throw new UnsafeUrlException('URL is too long.', 'URL_TOO_LONG');
        }

        $parts = parse_url($url);

        if ($parts === false || ! isset($parts['scheme'], $parts['host']) || $parts['host'] === '') {
            throw new UnsafeUrlException('URL is malformed.', 'MALFORMED_URL');
        }

        $scheme = strtolower($parts['scheme']);

        if (! in_array($scheme, ['http', 'https'], true)) {
            throw new UnsafeUrlException('Only HTTP and HTTPS URLs are allowed.', 'UNSUPPORTED_SCHEME');
        }

        if (isset($parts['user']) && $parts['user'] !== '' || isset($parts['pass']) && $parts['pass'] !== '') {
            throw new UnsafeUrlException('URLs with embedded credentials are not allowed.', 'CREDENTIALS_IN_URL');
        }

        $host = $this->normalizeHost($parts['host']);

        if ($this->isIpLiteral($host)) {
            $ip = $this->stripIpv6Brackets($host);

            if (! filter_var($ip, FILTER_VALIDATE_IP)) {
                throw new UnsafeUrlException('URL host is not a valid IP address.', 'INVALID_HOST');
            }

            if ($this->ipValidator->isPrivateIp($ip)) {
                throw new UnsafeUrlException('URL resolves to a private or restricted network.', 'PRIVATE_IP');
            }

            return $this->buildValidatedUrl($parts, $scheme, $ip, $ip);
        }

        if ($this->looksLikeNumericIp($host)) {
            throw new UnsafeUrlException('URL host looks like a numeric IP representation.', 'AMBIGUOUS_HOST');
        }

        if (! filter_var($host, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME)) {
            throw new UnsafeUrlException('URL host is not a valid hostname.', 'INVALID_HOST');
        }

        $resolved = $this->dnsResolver->resolve($host);

        if ($resolved === []) {
            throw new UnsafeUrlException('URL host could not be resolved.', 'DNS_FAILED');
        }

        $publicIps = array_filter($resolved, fn (string $ip) => $this->ipValidator->isPublicIp($ip));

        if ($publicIps === []) {
            throw new UnsafeUrlException('URL resolves only to private or restricted addresses.', 'PRIVATE_IP');
        }

        return $this->buildValidatedUrl($parts, $scheme, $host, array_values($publicIps)[0]);
    }

    private function normalizeHost(string $host): string
    {
        $host = $this->stripIpv6Brackets($host);

        if (function_exists('idn_to_ascii')) {
            $ascii = @idn_to_ascii($host, IDNA_DEFAULT, INTL_IDNA_VARIANT_UTS46);

            if ($ascii !== false) {
                $host = $ascii;
            } elseif (preg_match('/[^\x20-\x7E]/', $host)) {
                throw new UnsafeUrlException('Internationalized hostname could not be converted to ASCII.', 'IDN_FAILED');
            }
        } elseif (preg_match('/[^\x20-\x7E]/', $host)) {
            throw new UnsafeUrlException('Internationalized hostnames are not supported.', 'IDN_NOT_SUPPORTED');
        }

        return strtolower($host);
    }

    private function stripIpv6Brackets(string $host): string
    {
        if (str_starts_with($host, '[') && str_ends_with($host, ']')) {
            return substr($host, 1, -1);
        }

        return $host;
    }

    private function isIpLiteral(string $host): bool
    {
        $unbracketed = $this->stripIpv6Brackets($host);

        return filter_var($unbracketed, FILTER_VALIDATE_IP) !== false;
    }

    private function looksLikeNumericIp(string $host): bool
    {
        if (ctype_digit($host) || preg_match('/^0x[0-9a-f]+$/i', $host) || preg_match('/^0[0-7]+$/', $host)) {
            return true;
        }

        if (preg_match('/^(?:(?:0x[0-9a-fA-F]{1,2}|0[0-7]{1,3}|[0-9]{1,3})\.){3}(?:0x[0-9a-fA-F]{1,2}|0[0-7]{1,3}|[0-9]{1,3})$/', $host)) {
            return true;
        }

        if (str_contains($host, ':') && ! filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            return true;
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $parts
     */
    private function buildValidatedUrl(array $parts, string $scheme, string $host, string $ip): ValidatedUrl
    {
        $port = $parts['port'] ?? ($scheme === 'https' ? 443 : 80);
        $path = $parts['path'] ?? '/';
        $query = $this->normalizeQuery($parts['query'] ?? null);

        $normalized = $scheme.'://';

        if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $normalized .= '['.$host.']';
        } else {
            $normalized .= $host;
        }

        if ($port !== ($scheme === 'https' ? 443 : 80)) {
            $normalized .= ':'.$port;
        }

        if ($path === '') {
            $path = '/';
        }

        $normalized .= $path;

        if ($query !== '') {
            $normalized .= '?'.$query;
        }

        return new ValidatedUrl(
            normalizedUrl: $normalized,
            scheme: $scheme,
            host: $host,
            port: $port,
            ip: $ip,
            path: $path,
        );
    }

    private function normalizeQuery(?string $query): string
    {
        if ($query === null || $query === '') {
            return '';
        }

        $pairs = [];
        @parse_str($query, $pairs);
        ksort($pairs);

        return http_build_query($pairs);
    }
}
