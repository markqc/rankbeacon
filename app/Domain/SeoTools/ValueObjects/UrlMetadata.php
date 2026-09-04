<?php

declare(strict_types=1);

namespace App\Domain\SeoTools\ValueObjects;

readonly class UrlMetadata
{
    public function __construct(
        public string $normalizedUrl,
        public string $finalUrl,
        public ?string $siteName,
        public ?string $title,
        public ?string $description,
        public ?string $canonicalUrl,
        public ?string $faviconUrl,
        public ?string $robots,
        public ?string $language,
        public ?string $ogTitle,
        public ?string $ogDescription,
        public ?string $ogSiteName,
        public ?string $breadcrumbPath,
        public int $status,
        public array $warnings,
        public string $fetchedAt,
    ) {}

    public function toArray(): array
    {
        return [
            'normalized_url' => $this->normalizedUrl,
            'final_url' => $this->finalUrl,
            'site_name' => $this->siteName,
            'title' => $this->title,
            'description' => $this->description,
            'canonical_url' => $this->canonicalUrl,
            'favicon_url' => $this->faviconUrl,
            'robots' => $this->robots,
            'language' => $this->language,
            'og_title' => $this->ogTitle,
            'og_description' => $this->ogDescription,
            'og_site_name' => $this->ogSiteName,
            'breadcrumb_path' => $this->breadcrumbPath,
            'status' => $this->status,
            'warnings' => $this->warnings,
            'fetched_at' => $this->fetchedAt,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            normalizedUrl: (string) $data['normalized_url'],
            finalUrl: (string) $data['final_url'],
            siteName: isset($data['site_name']) ? (string) $data['site_name'] : null,
            title: $data['title'] ?? null,
            description: $data['description'] ?? null,
            canonicalUrl: $data['canonical_url'] ?? null,
            faviconUrl: $data['favicon_url'] ?? null,
            robots: $data['robots'] ?? null,
            language: $data['language'] ?? null,
            ogTitle: $data['og_title'] ?? null,
            ogDescription: $data['og_description'] ?? null,
            ogSiteName: $data['og_site_name'] ?? null,
            breadcrumbPath: $data['breadcrumb_path'] ?? null,
            status: (int) $data['status'],
            warnings: is_array($data['warnings'] ?? null) ? $data['warnings'] : [],
            fetchedAt: (string) $data['fetched_at'],
        );
    }
}
