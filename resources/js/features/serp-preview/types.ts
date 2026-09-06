export type Device = 'desktop' | 'mobile';

export interface SerpState {
    url: string;
    siteName: string;
    title: string;
    description: string;
    breadcrumb: string;
    faviconUrl: string | null;
    device: Device;
}

export interface ApiData {
    normalized_url: string;
    final_url: string;
    site_name: string | null;
    title: string | null;
    description: string | null;
    canonical_url: string | null;
    favicon_url: string | null;
    robots: string | null;
    language: string | null;
    og_title: string | null;
    og_description: string | null;
    og_site_name: string | null;
    breadcrumb_path: string | null;
    status: number;
    warnings: string[];
    fetched_at: string;
}

export interface ApiResponse {
    data?: ApiData;
    error?: { code: string; message: string };
    meta?: { version: string; fetched_at: string };
}

export type FetchStatus =
    | { type: 'idle' }
    | { type: 'validating' }
    | { type: 'loading' }
    | { type: 'success'; message: string }
    | { type: 'partial-success'; message: string }
    | { type: 'rate-limited'; message: string }
    | { type: 'timeout'; message: string }
    | { type: 'blocked-url'; message: string }
    | { type: 'unsupported-content'; message: string }
    | { type: 'error'; message: string };
