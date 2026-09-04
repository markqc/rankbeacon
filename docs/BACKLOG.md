# Post-MVP Backlog

This is a prioritized list of work to consider after the MVP is live. Do not implement these until the MVP has been deployed and stabilized.

## P1 — Core improvements

- **Nonce-based CSP**: Remove `'unsafe-inline'` from `script-src` and `style-src` by adding Vite/Blade nonces to the Inertia JSON-LD and asset tags.
- **Server-side rendering (SSR) for Inertia**: Allow search engines and social crawlers to see rendered `<title>` and `<meta>` tags without JavaScript.
- **Lighthouse baseline**: Record production Lighthouse scores for `/` and `/tools/serp-preview` and set performance budgets.
- **Cross-browser test matrix**: Manual or Playwright checks on Chrome, Firefox, Safari, and mobile viewports.

## P2 — SERP Preview enhancements

- **JavaScript rendering service**: Add an optional headless-browser path for pages that inject metadata client-side.
- **Saved projects/accounts**: Allow users to save URLs, titles, and descriptions locally or with accounts.
- **Bulk URL checks**: Upload a CSV and preview snippets for many pages at once.
- **Sharing**: Generate a shareable link that encodes the preview state.

## P3 — New SEO tools

- **Meta Tag Checker**: Validate title, description, viewport, Open Graph, and canonical tags.
- **Robots.txt Tester**: Parse and test `robots.txt` rules against example user-agents and paths.
- **Open Graph Preview**: Show how a link renders on Facebook, LinkedIn, X, etc.
- **Mobile Preview Suite**: More device sizes and form factors for SERP and social previews.
- **Internal Link Visualizer**: Crawl and visualize internal page connections.

## P4 — Platform and operations

- **Administration panel**: Manage rate limits, block lists, and user accounts if accounts are introduced.
- **Analytics and telemetry**: Track tool usage without collecting personal data; respect `DNT` and GDPR.
- **Subscriptions**: Metered or premium feature gating.
- **Health and SLO dashboards**: External uptime, latency, and error-rate monitoring.

## P5 — Technical debt

- **PHPStan or Psalm**: Add static analysis to the PHP pipeline.
- **End-to-end tests**: Playwright or Dusk coverage for the SERP tool and navigation.
- **Visual regression**: Screenshot diffs for key pages.
- **Dependency update automation**: Renovate or Dependabot for `composer` and `npm`.
