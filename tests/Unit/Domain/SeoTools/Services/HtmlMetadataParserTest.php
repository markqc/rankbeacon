<?php

declare(strict_types=1);

namespace Tests\Unit\Domain\SeoTools\Services;

use App\Domain\SeoTools\Services\HtmlMetadataParser;
use PHPUnit\Framework\TestCase;

class HtmlMetadataParserTest extends TestCase
{
    private HtmlMetadataParser $parser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->parser = new HtmlMetadataParser;
    }

    public function test_extracts_core_metadata(): void
    {
        $html = <<<'HTML'
<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="utf-8">
    <title>RankBeacon SERP Preview</title>
    <meta name="description" content="Preview your search result.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="/canonical">
    <link rel="icon" href="/favicon.ico">
    <meta property="og:title" content="OG Title">
    <meta property="og:description" content="OG Description">
    <meta property="og:site_name" content="RankBeacon">
</head>
<body></body>
</html>
HTML;

        $result = $this->parser->parse($html, 'https://rankbeacon.app/tools/serp-preview');

        $this->assertSame('RankBeacon SERP Preview', $result['title']);
        $this->assertSame('Preview your search result.', $result['description']);
        $this->assertSame('index, follow', $result['robots']);
        $this->assertSame('en-US', $result['language']);
        $this->assertSame('https://rankbeacon.app/canonical', $result['canonical_url']);
        $this->assertSame('https://rankbeacon.app/favicon.ico', $result['favicon_url']);
        $this->assertSame('OG Title', $result['og_title']);
        $this->assertSame('OG Description', $result['og_description']);
        $this->assertSame('RankBeacon', $result['og_site_name']);
        $this->assertSame('RankBeacon', $result['site_name']);
        $this->assertSame('canonical', $result['breadcrumb_path']);
        $this->assertSame([], $result['warnings']);
    }

    public function test_extracts_jsonld_site_name(): void
    {
        $html = <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>Example</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "JSON-LD Site",
        "url": "https://example.com/"
    }
    </script>
</head>
<body></body>
</html>
HTML;

        $result = $this->parser->parse($html, 'https://example.com/');

        $this->assertSame('JSON-LD Site', $result['site_name']);
    }

    public function test_resolves_relative_favicon_and_canonical(): void
    {
        $html = <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>Relative</title>
    <link rel="canonical" href="/blog/post">
    <link rel="shortcut icon" href="/assets/icon.png">
</head>
<body></body>
</html>
HTML;

        $result = $this->parser->parse($html, 'https://example.com/');

        $this->assertSame('https://example.com/blog/post', $result['canonical_url']);
        $this->assertSame('https://example.com/assets/icon.png', $result['favicon_url']);
    }

    public function test_falls_back_to_default_favicon(): void
    {
        $html = <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>No icon</title>
</head>
<body></body>
</html>
HTML;

        $result = $this->parser->parse($html, 'https://example.com/');

        $this->assertSame('https://example.com/favicon.ico', $result['favicon_url']);
    }

    public function test_returns_warnings_for_missing_metadata(): void
    {
        $html = '<html><body></body></html>';

        $result = $this->parser->parse($html, 'https://example.com/');

        $this->assertContains('No title tag found.', $result['warnings']);
        $this->assertContains('No meta description found.', $result['warnings']);
        $this->assertContains('No canonical link found.', $result['warnings']);
        $this->assertNull($result['title']);
        $this->assertNull($result['description']);
    }

    public function test_warns_on_duplicate_tags(): void
    {
        $html = <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>One</title>
    <title>Two</title>
    <meta name="description" content="First">
    <meta name="description" content="Second">
</head>
<body></body>
</html>
HTML;

        $result = $this->parser->parse($html, 'https://example.com/');

        $this->assertSame('One', $result['title']);
        $this->assertSame('First', $result['description']);
        $this->assertContains('Multiple title tags found.', $result['warnings']);
        $this->assertContains('Multiple meta description tags found.', $result['warnings']);
    }

    public function test_handles_unicode_content(): void
    {
        $html = <<<'HTML'
<!DOCTYPE html>
<html lang="ar">
<head>
    <title>مرحبا بالعالم</title>
    <meta name="description" content="وصف تجريبي">
</head>
<body></body>
</html>
HTML;

        $result = $this->parser->parse($html, 'https://example.com/');

        $this->assertSame('مرحبا بالعالم', $result['title']);
        $this->assertSame('وصف تجريبي', $result['description']);
        $this->assertSame('ar', $result['language']);
    }

    public function test_handles_malformed_html(): void
    {
        $html = '<html><head><title>Broken<meta name=description content="Missing quotes"><body>';

        $result = $this->parser->parse($html, 'https://example.com/');

        $this->assertSame('Broken', $result['title']);
        $this->assertSame('Missing quotes', $result['description']);
    }
}
