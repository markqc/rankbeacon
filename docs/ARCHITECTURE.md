# Architecture

## Request flow

1. The web server routes all public requests to `public/index.php`.
2. Laravel bootstraps the application, runs the `web` middleware stack, and dispatches to `routes/web.php`.
3. `HandleInertiaRequests` prepares the shared Inertia root view `resources/views/app.blade.php`.
4. Vite injects the built CSS and React bundle. Inertia renders the requested React page from `resources/js/pages`.
5. JSON responses for `/health/*` and `/api/v1/*` bypass the root view and return typed payloads.

## Folder responsibilities

- `app/Http/Controllers` — thin HTTP layer, mostly Inertia responses and JSON endpoints.
- `app/Http/Middleware` — shared request/response concerns (security headers, Inertia root view).
- `app/Domain/SeoTools` — domain services and actions for each SEO tool module.
- `resources/js/pages` — Inertia page components that map 1:1 to routes.
- `resources/js/layouts` — shared page layouts.
- `resources/js/components` — reusable UI components.
- `resources/js/features/<tool>` — tool-specific client logic (e.g. `serp-preview`).
- `resources/js/types` — shared TypeScript definitions.
- `docs/` — project documentation.

## Module conventions

- Each tool is a self-contained feature module on the backend and frontend.
- URL safety, parsing, and normalization live in `app/Domain/SeoTools`, not in controllers.
- APIs are versioned under `/api/v1`.
- React pages use TypeScript and the shared `MainLayout`.
- Tailwind brand tokens live in `resources/css/app.css` and use CSS-first configuration with Tailwind v4.
