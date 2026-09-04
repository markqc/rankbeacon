# Content Review Checklist

Use this list before launch or before any major public release.

## Legal

- [ ] `resources/js/pages/Privacy.tsx` reviewed by a privacy/legal professional.
- [ ] `resources/js/pages/Terms.tsx` reviewed by a legal professional.
- [ ] Confirm the disclaimer in the Terms page is sufficient for the target jurisdiction.
- [ ] Verify log retention, IP handling, and cache TTL language in the Privacy page match actual system behavior.

## Brand and copy

- [ ] All pages refer to the product as **RankBeacon**, the brand as **Authority Lighthouse**, and the developer as **MCaneda.com**.
- [ ] No placeholder text remains in public pages.
- [ ] Guide content is accurate and does not overstate search-engine behavior.

## SEO

- [ ] Every public page has a unique `<title>` and `<meta name="description">`.
- [ ] Canonical URLs are correct in `MainLayout` and `PageHead`.
- [ ] `/sitemap.xml` includes all public canonical pages.
- [ ] `/robots.txt` is `Allow` in production and `Disallow` elsewhere.
- [ ] Structured data is valid and does not make unverifiable claims.

## Accessibility

- [ ] Each page has one logical `<h1>`.
- [ ] Images and icons have appropriate `aria-hidden` or `alt` text.
- [ ] Form labels are associated with controls.
- [ ] Focus order is logical on every page.
- [ ] Status and error messages use `aria-live` or `role="alert"`.

## Tools and functionality

- [ ] SERP Preview fetch works on a known public URL.
- [ ] Private and malformed URLs are blocked with a clear message.
- [ ] Error pages (`/404` and 500) display correctly.
- [ ] Coming-soon tools are clearly labeled and not presented as active.
