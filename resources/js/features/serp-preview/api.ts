import type { ApiData, ApiResponse } from './types';

function csrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export async function fetchMetadata(url: string, signal?: AbortSignal): Promise<ApiResponse> {
    const token = csrfToken();

    if (!token) {
        throw new Error('CSRF token not found. Refresh the page and try again.');
    }

    const response = await fetch('/api/v1/serp-preview/fetch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': token,
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ url }),
        signal,
    });

    let body: unknown;

    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        if (response.status === 429) {
            return {
                error: {
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Too many requests. Please wait a moment before trying again.',
                },
            };
        }

        if (response.status === 419) {
            return {
                error: {
                    code: 'CSRF_TOKEN_MISMATCH',
                    message: 'CSRF token mismatch. Refresh the page and try again.',
                },
            };
        }

        if (body && typeof body === 'object' && 'error' in body) {
            return body as ApiResponse;
        }

        if (body && typeof body === 'object' && 'message' in body) {
            return {
                error: {
                    code: `HTTP_${response.status}`,
                    message: String((body as { message: unknown }).message),
                },
            };
        }

        return {
            error: {
                code: `HTTP_${response.status}`,
                message: `Request failed with status ${response.status}.`,
            },
        };
    }

    return (body ?? {}) as ApiResponse;
}

export function isSafeFaviconUrl(url: string | null, pageUrl: string): boolean {
    if (!url) {
        return false;
    }

    try {
        const favicon = new URL(url);
        const page = new URL(pageUrl);

        if (favicon.protocol !== page.protocol) {
            return false;
        }

        if (favicon.protocol !== 'https:' && favicon.protocol !== 'http:') {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

export function normalizeUrlForCompare(url: string): string {
    return url.replace(/\/$/, '');
}

export function buildWarnings(data: ApiData): string[] {
    const warnings: string[] = [];

    if (data.robots && /noindex/i.test(data.robots)) {
        warnings.push('The page has a noindex robots directive, so search engines may not show it in results.');
    }

    if (
        data.canonical_url &&
        data.final_url &&
        normalizeUrlForCompare(data.canonical_url) !== normalizeUrlForCompare(data.final_url)
    ) {
        warnings.push('The canonical URL differs from the final fetched URL.');
    }

    if (data.status >= 400) {
        warnings.push(`The server returned an HTTP ${data.status} status, so metadata may not be useful.`);
    }

    if (!data.title) {
        warnings.push('No title tag was found on the page.');
    }

    if (!data.description) {
        warnings.push('No meta description was found on the page.');
    }

    if (data.favicon_url && !isSafeFaviconUrl(data.favicon_url, data.final_url)) {
        warnings.push('The detected favicon URL was skipped because it could cause mixed content or an unsafe load.');
    }

    return warnings;
}
