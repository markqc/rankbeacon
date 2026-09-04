# Stack

| Component | Version | Notes |
|---|---|---|
| PHP | 8.3.28 | Required by Laravel 13.x |
| Composer | 2.7.7 | Dependency manager |
| Node.js | 24.10.0 | JavaScript runtime |
| npm | 11.6.0 | Package manager |
| laravel/framework | 13.30.1 | Latest stable at setup |
| inertiajs/inertia-laravel | 3.3.2 | Server-side Inertia adapter |
| @inertiajs/react | 3.7.0 | Client-side Inertia adapter |
| React | 19.2.8 | UI library |
| React DOM | 19.2.8 | |
| TypeScript | 6.0.3 | |
| Tailwind CSS | 4.3.3 | CSS-first configuration via `@tailwindcss/vite` |
| Vite | 8.2.2 | Asset build tool |
| @vitejs/plugin-react | 6.1.1 | Fast-refresh for React |
| Vitest | 5.0.0 | Frontend unit tests |
| @testing-library/react | 16.3.3 | React test helpers |
| jsdom | 29.1.1 | DOM environment for Vitest |
| PHPUnit | 12.5.34 | Backend tests |
| Laravel Pint | 1.30.5 | PHP formatting |
| ESLint | 9.39.5 | JS/TS linting |
| Prettier | 3.9.6 | JS/TS formatting |

## Major decisions

- Laravel 13.x is the latest stable version available at project kickoff and is supported by PHP 8.3.28.
- SQLite is used for local development to keep the setup self-contained.
- MySQL/MariaDB is the intended production database.
- Inertia.js bridges Laravel and React so the application remains a single codebase with server-rendered page state.
- Tailwind v4 is used in CSS-first mode through `@import 'tailwindcss'`, avoiding a JS config file.
- Application timezone is explicitly set to UTC for stored timestamps.
