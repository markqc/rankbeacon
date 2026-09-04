<?php

declare(strict_types=1);

namespace App\Domain\SeoTools\Services;

use DOMDocument;
use DOMNode;
use GuzzleHttp\Psr7\Uri;
use GuzzleHttp\Psr7\UriResolver;

class HtmlMetadataParser
{
    public function parse(string $html, string $baseUrl): array
    {
        $doc = $this->loadDocument($html);

        $title = $this->parseTitle($doc);
        $description = $this->parseMeta($doc, 'description');
        $robots = $this->parseMeta($doc, 'robots');
        $canonical = $this->resolve($this->parseLink($doc, 'canonical'), $baseUrl);
        $favicon = $this->resolve($this->parseFavicon($doc) ?? '/favicon.ico', $baseUrl);
        $language = $this->parseLanguage($doc);
        $ogTitle = $this->parseOg($doc, 'og:title');
        $ogDescription = $this->parseOg($doc, 'og:description');
        $ogSiteName = $this->parseOg($doc, 'og:site_name');
        $jsonLdSiteName = $this->parseJsonLdSiteName($doc);
        $breadcrumbPath = $this->deriveBreadcrumbPath($canonical ?? $baseUrl);

        $warnings = $this->collectWarnings($doc, $title, $description, $canonical, $favicon);

        return [
            'title' => $title,
            'description' => $description,
            'canonical_url' => $canonical,
            'favicon_url' => $favicon,
            'robots' => $robots,
            'language' => $language,
            'og_title' => $ogTitle,
            'og_description' => $ogDescription,
            'og_site_name' => $ogSiteName,
            'jsonld_site_name' => $jsonLdSiteName,
            'site_name' => $ogSiteName ?? $jsonLdSiteName ?? $this->deriveSiteName($baseUrl, $title),
            'breadcrumb_path' => $breadcrumbPath,
            'warnings' => $warnings,
        ];
    }

    private function loadDocument(string $html): DOMDocument
    {
        $previous = libxml_use_internal_errors(true);
        $doc = new DOMDocument;
        $doc->loadHTML('<?xml encoding="UTF-8">'.$html, LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_HTML_NODEFDTD);
        libxml_use_internal_errors($previous);

        return $doc;
    }

    private function parseTitle(DOMDocument $doc): ?string
    {
        $node = $doc->getElementsByTagName('title')->item(0);

        return $this->normalizeText($node?->textContent);
    }

    private function parseMeta(DOMDocument $doc, string $name): ?string
    {
        $tags = $doc->getElementsByTagName('meta');

        foreach ($tags as $tag) {
            if (! $tag instanceof DOMNode) {
                continue;
            }

            $metaName = strtolower($this->getAttribute($tag, 'name'));
            if ($metaName === $name) {
                return $this->normalizeText($this->getAttribute($tag, 'content'));
            }
        }

        return null;
    }

    private function parseOg(DOMDocument $doc, string $property): ?string
    {
        $tags = $doc->getElementsByTagName('meta');

        foreach ($tags as $tag) {
            if (! $tag instanceof DOMNode) {
                continue;
            }

            $prop = strtolower($this->getAttribute($tag, 'property'));
            if ($prop === strtolower($property)) {
                return $this->normalizeText($this->getAttribute($tag, 'content'));
            }
        }

        return null;
    }

    private function parseLink(DOMDocument $doc, string $rel): ?string
    {
        $links = $doc->getElementsByTagName('link');

        foreach ($links as $link) {
            if (! $link instanceof DOMNode) {
                continue;
            }

            $linkRel = strtolower($this->getAttribute($link, 'rel'));
            if ($linkRel === $rel) {
                return $this->normalizeText($this->getAttribute($link, 'href'));
            }
        }

        return null;
    }

    private function parseFavicon(DOMDocument $doc): ?string
    {
        $links = $doc->getElementsByTagName('link');

        foreach ($links as $link) {
            if (! $link instanceof DOMNode) {
                continue;
            }

            $rel = strtolower($this->getAttribute($link, 'rel'));
            if (str_contains($rel, 'icon') || str_contains($rel, 'shortcut')) {
                return $this->normalizeText($this->getAttribute($link, 'href'));
            }
        }

        return null;
    }

    private function parseLanguage(DOMDocument $doc): ?string
    {
        $html = $doc->getElementsByTagName('html')->item(0);

        return $html instanceof DOMNode ? $this->normalizeText($this->getAttribute($html, 'lang')) : null;
    }

    private function parseJsonLdSiteName(DOMDocument $doc): ?string
    {
        $scripts = $doc->getElementsByTagName('script');

        foreach ($scripts as $script) {
            if (! $script instanceof DOMNode) {
                continue;
            }

            $type = strtolower($this->getAttribute($script, 'type'));
            if ($type !== 'application/ld+json') {
                continue;
            }

            $json = $this->cleanJsonLd($script->textContent ?? '');
            $data = json_decode($json, true);

            if (! is_array($data)) {
                continue;
            }

            $name = $this->findNameInStructuredData($data);
            if ($name !== null) {
                return $this->normalizeText($name);
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function findNameInStructuredData(array $data): ?string
    {
        $allowedTypes = ['website', 'organization', 'brand', 'webpage'];

        if (isset($data['@graph']) && is_array($data['@graph'])) {
            foreach ($data['@graph'] as $item) {
                $name = $this->extractName($item, $allowedTypes);
                if ($name !== null) {
                    return $name;
                }
            }
        }

        $name = $this->extractName($data, $allowedTypes);
        if ($name !== null) {
            return $name;
        }

        return null;
    }

    /**
     * @param  array<string, mixed>|mixed  $item
     * @param  string[]  $allowedTypes
     */
    private function extractName(mixed $item, array $allowedTypes): ?string
    {
        if (! is_array($item)) {
            return null;
        }

        $type = strtolower(is_string($item['@type'] ?? null) ? $item['@type'] : '');
        $types = $type === '' ? [] : array_map('strtolower', explode(',', $type));

        foreach ($allowedTypes as $allowed) {
            if (in_array($allowed, $types, true) && isset($item['name']) && is_string($item['name']) && $item['name'] !== '') {
                return $item['name'];
            }
        }

        return null;
    }

    private function cleanJsonLd(string $content): string
    {
        $content = preg_replace('/\/\*.*?\*\//s', '', $content) ?? $content;
        $content = str_replace(['<![CDATA[', ']]>'], '', $content);

        return trim($content);
    }

    private function deriveBreadcrumbPath(string $url): ?string
    {
        $parts = parse_url($url);
        $path = $parts['path'] ?? '/';

        $trimmed = trim($path, '/');

        return $trimmed === '' ? null : $trimmed;
    }

    private function deriveSiteName(string $baseUrl, ?string $title): ?string
    {
        $parts = parse_url($baseUrl);
        $host = $parts['host'] ?? null;

        if ($host !== null && $host !== '') {
            return $host;
        }

        return $title;
    }

    /**
     * @return list<string>
     */
    private function collectWarnings(DOMDocument $doc, ?string $title, ?string $description, ?string $canonical, ?string $favicon): array
    {
        $warnings = [];

        if ($title === null || $title === '') {
            $warnings[] = 'No title tag found.';
        }

        if ($description === null || $description === '') {
            $warnings[] = 'No meta description found.';
        }

        if ($canonical === null || $canonical === '') {
            $warnings[] = 'No canonical link found.';
        }

        if ($favicon === null || $favicon === '') {
            $warnings[] = 'No favicon link found.';
        }

        if ($doc->getElementsByTagName('title')->length > 1) {
            $warnings[] = 'Multiple title tags found.';
        }

        $descriptionCount = 0;
        $tags = $doc->getElementsByTagName('meta');

        foreach ($tags as $tag) {
            if (! $tag instanceof DOMNode) {
                continue;
            }

            $name = strtolower($this->getAttribute($tag, 'name'));
            if ($name === 'description') {
                $descriptionCount++;
            }
        }

        if ($descriptionCount > 1) {
            $warnings[] = 'Multiple meta description tags found.';
        }

        return array_values(array_unique($warnings));
    }

    private function resolve(?string $url, string $baseUrl): ?string
    {
        if ($url === null || $url === '') {
            return null;
        }

        try {
            return (string) UriResolver::resolve(new Uri($baseUrl), new Uri($url));
        } catch (\Throwable) {
            return null;
        }
    }

    private function getAttribute(DOMNode $node, string $attribute): string
    {
        if ($node->attributes === null) {
            return '';
        }

        $attr = $node->attributes->getNamedItem($attribute);

        return $attr?->nodeValue ?? '';
    }

    private function normalizeText(?string $text): ?string
    {
        if ($text === null) {
            return null;
        }

        $text = trim(preg_replace('/\s+/', ' ', $text) ?? $text);

        return $text === '' ? null : $text;
    }
}
