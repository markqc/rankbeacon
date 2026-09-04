import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';

createInertiaApp({
    title: (title) => (title ? `${title} — RankBeacon` : 'RankBeacon'),
    resolve: (name) => {
        const pages = import.meta.glob<{ default: ComponentType }>(['./pages/**/*.tsx', '!**/*.test.tsx']);
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        return page().then((module) => module.default);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: { color: '#0EA5A8' },
});
