import { useEffect } from 'react';

const DEFAULT_FAVICON = '/favicon.ico';

let lastValue: string | null | undefined;

/**
 * Keeps the document favicon in sync with the configured branding value.
 * Ensures Inertia client-side navigations update or remove the icon, and
 * appends a cache-busting query so the browser reloads the icon when it
 * is newly uploaded or removed.
 */
export function useFavicon(faviconPath: string | null | undefined) {
    useEffect(() => {
        const changed = lastValue !== undefined && lastValue !== faviconPath;
        lastValue = faviconPath;

        const base = faviconPath || DEFAULT_FAVICON;
        const href = changed ? `${base}${base.includes('?') ? '&' : '?'}v=${Date.now()}` : base;

        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        link.href = href;
        link.type = faviconPath ? 'image/png' : 'image/x-icon';

        const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
        if (faviconPath) {
            const touch = apple ?? document.createElement('link');
            touch.rel = 'apple-touch-icon';
            touch.href = href;
            if (!apple) {
                document.head.appendChild(touch);
            }
        } else if (apple) {
            apple.remove();
        }
    }, [faviconPath]);
}
