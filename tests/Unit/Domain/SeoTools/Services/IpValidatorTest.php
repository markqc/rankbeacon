<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\SeoTools\Services;

use App\Domain\SeoTools\Services\IpValidator;
use PHPUnit\Framework\TestCase;

class IpValidatorTest extends TestCase
{
    private IpValidator $validator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->validator = new IpValidator;
    }

    public function test_public_ipv4_addresses_are_allowed(): void
    {
        $this->assertTrue($this->validator->isPublicIp('8.8.8.8'));
        $this->assertTrue($this->validator->isPublicIp('1.1.1.1'));
    }

    public function test_private_ipv4_ranges_are_rejected(): void
    {
        $this->assertTrue($this->validator->isPrivateIp('10.0.0.1'));
        $this->assertTrue($this->validator->isPrivateIp('172.16.0.1'));
        $this->assertTrue($this->validator->isPrivateIp('192.168.1.1'));
        $this->assertTrue($this->validator->isPrivateIp('127.0.0.1'));
        $this->assertTrue($this->validator->isPrivateIp('169.254.169.254'));
        $this->assertTrue($this->validator->isPrivateIp('0.0.0.0'));
        $this->assertTrue($this->validator->isPrivateIp('100.64.0.1'));
        $this->assertTrue($this->validator->isPrivateIp('255.255.255.255'));
    }

    public function test_public_ipv6_addresses_are_allowed(): void
    {
        $this->assertTrue($this->validator->isPublicIp('2001:4860:4860::8888'));
    }

    public function test_private_ipv6_ranges_are_rejected(): void
    {
        $this->assertTrue($this->validator->isPrivateIp('::1'));
        $this->assertTrue($this->validator->isPrivateIp('::'));
        $this->assertTrue($this->validator->isPrivateIp('fc00::1'));
        $this->assertTrue($this->validator->isPrivateIp('fe80::1'));
        $this->assertTrue($this->validator->isPrivateIp('ff02::1'));
        $this->assertTrue($this->validator->isPrivateIp('2001:db8::1'));
        $this->assertTrue($this->validator->isPrivateIp('::ffff:127.0.0.1'));
    }

    public function test_invalid_ips_are_treated_as_private(): void
    {
        $this->assertTrue($this->validator->isPrivateIp('not-an-ip'));
        $this->assertTrue($this->validator->isPrivateIp('256.256.256.256'));
    }
}
