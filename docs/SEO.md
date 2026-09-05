# SEO Implementation

## Page metadata

Every public page uses `MainLayout` and `PageHead` to emit:

- `<title>` via Inertia `Head`
- `<meta name="description">`
- `<meta name="theme-color" content="#10233F">`
- `<link rel="canonical" href="...">`
- `<meta name="robots">` when a page passes the optional `robots` prop (e.g., `/privacy` and `/terms` use `index,follow`)
- Open Graph: `og:url`, `og:title`, `og:description`, `og:image` (when provided), `og:type`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` (when an OG image is provided)

Canonical URLs are computed in `MainLayout` from `config('app.url')` and the current Inertia path unless a page explicitly overrides them.

## Sitemap

A dynamic XML sitemap is served at `/sitemap.xml`. It lists the public canonical pages:

- `/`
- `/tools`
- `/tools/serp-preview`
- `/guides`
- `/about`
- `/privacy`
- `/terms`

The sitemap uses `now()->toDateString()` for `<lastmod>` and `monthly` `<changefreq>`.

## robots.txt

`/robots.txt` is generated per environment:

- **Production (`APP_ENV=production`)**: `Allow: /` with a `Sitemap:` reference.
- **All other environments**: `Disallow: /` so staging and local builds are not indexed.

## Structured data

`Home.tsx` includes `application/ld+json` with `Organization` and `WebSite` schema. Additional pages should add structured data only when it is accurate and relevant.

## H1 and heading structure

- Each page has one logical `<h1>` via `SectionHeading as="h1"`.
- Subsequent headings are `<h2>` or `<h3>` and follow document order.
- The SERP Preview tool inputs are labelled with `FormField` and `label` elements; the preview result is `aria-label="SERP preview"`.

## Limitations

- No brand `og:image` is configured yet. Add `ogImage` to `MainLayout` once an approved social-share asset exists.
- Twitter Card tags only render when an `ogImage` is provided.
- The sitemap is manually maintained; new public pages must be added to the `$pages` array in `routes/web.php`.
