<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\SeoTools\Services;

use App\Domain\SeoTools\Exceptions\UnsafeUrlException;
use App\Domain\SeoTools\Services\Contracts\DnsResolverInterface;
use App\Domain\SeoTools\Services\IpValidator;
use App\Domain\SeoTools\Services\UrlSecurityValidator;
use PHPUnit\Framework\TestCase;

class UrlSecurityValidatorTest extends TestCase
{
    private UrlSecurityValidator $validator;

    protected function setUp(): void
    {
        parent::setUp();

        $resolver = new class implements DnsResolverInterface
        {
            public function resolve(string $host): array
            {
                return match ($host) {
                    'example.com' => ['93.184.216.34'],
                    'internal.example' => ['192.168.1.1'],
                    'ipv6.example' => ['2001:4860:4860::8888'],
                    'localhost' => ['127.0.0.1'],
                    'unresolvable.test' => [],
                    default => [],
                };
            }
        };

        $this->validator = new UrlSecurityValidator(new IpValidator, $resolver);
    }

    public function test_accepts_a_public_domain(): void
    {
        $validated = $this->validator->validate('https://example.com/page?b=2&a=1');

        $this->assertSame('https://example.com/page?a=1&b=2', $validated->normalizedUrl);
        $this->assertSame('93.184.216.34', $validated->ip);
    }

    public function test_rejects_private_domain_resolution(): void
    {
        $this->expectException(UnsafeUrlException::class);
        $this->expectExceptionMessage('private');

        $this->validator->validate('https://internal.example/');
    }

    public function test_rejects_unresolvable_domains(): void
    {
        $this->expectException(UnsafeUrlException::class);
        $this->expectExceptionMessage('could not be resolved');

        $this->validator->validate('https://unresolvable.test/');
    }

    public function test_accepts_public_ipv4_literal(): void
    {
        $validated = $this->validator->validate('http://1.1.1.1/');

        $this->assertSame('1.1.1.1', $validated->ip);
        $this->assertSame('http://1.1.1.1/', $validated->normalizedUrl);
    }

    public function test_rejects_private_ipv4_literal(): void
    {
        $this->expectException(UnsafeUrlException::class);

        $this->validator->validate('http://127.0.0.1/');
    }

    public function test_rejects_loopback_ipv6_literal(): void
    {
        $this->expectException(UnsafeUrlException::class);

        $this->validator->validate('http://[::1]/');
    }

    public function test_rejects_public_ipv6_that_resolves_to_private(): void
    {
        $this->expectException(UnsafeUrlException::class);

        $this->validator->validate('http://localhost/');
    }

    public function test_rejects_embedded_credentials(): void
    {
        $this->expectException(UnsafeUrlException::class);
        $this->expectExceptionMessage('credentials');

        $this->validator->validate('http://user:pass@example.com/');
    }

    public function test_rejects_non_http_schemes(): void
    {
        $this->expectException(UnsafeUrlException::class);
        $this->expectExceptionMessage('Only HTTP and HTTPS');

        $this->validator->validate('ftp://example.com/');
    }

    public function test_rejects_malformed_urls(): void
    {
        $this->expectException(UnsafeUrlException::class);

        $this->validator->validate('not a url');
    }

    public function test_rejects_decimal_ip_representations(): void
    {
        $this->expectException(UnsafeUrlException::class);

        $this->validator->validate('http://2130706433/');
    }

    public function test_rejects_hex_ip_representations(): void
    {
        $this->expectException(UnsafeUrlException::class);

        $this->validator->validate('http://0x7f000001/');
    }

    public function test_rejects_dotted_hex_and_octal_ip_representations(): void
    {
        $this->expectException(UnsafeUrlException::class);

        $this->validator->validate('http://0x7f.0x0.0x0.0x1/');
    }

    public function test_rejects_out_of_range_ipv4(): void
    {
        $this->expectException(UnsafeUrlException::class);

        $this->validator->validate('http://256.1.2.3/');
    }

    public function test_normalizes_default_port_and_fragment(): void
    {
        $validated = $this->validator->validate('https://example.com:443/page#section');

        $this->assertSame('https://example.com/page', $validated->normalizedUrl);
    }
}
