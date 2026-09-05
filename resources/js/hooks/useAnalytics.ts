import { useEffect, useRef } from 'react';

function csrfToken(): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? null;
}

function trackPageView(path: string) {
    const token = csrfToken();

    fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { 'X-CSRF-TOKEN': token } : {}),
        },
        body: JSON.stringify({
            event_type: 'page_view',
            path,
        }),
    }).catch(() => {
        // Fail silently so analytics never block the UI.
    });
}

export function useAnalytics(path: string) {
    const lastPath = useRef<string | null>(null);

    useEffect(() => {
        if (import.meta.env.MODE === 'test') {
            return;
        }

        if (typeof window === 'undefined') {
            return;
        }

        if (lastPath.current === path) {
            return;
        }

        lastPath.current = path;
        trackPageView(path);
    }, [path]);
}
