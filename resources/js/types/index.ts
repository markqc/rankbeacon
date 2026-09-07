import type { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface Role {
    id: number;
    name: string;
    label: string;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive';
    avatar_path?: string | null;
    last_login_at: string | null;
    created_at: string | null;
    roles: Role[];
}

export interface ActivityLog {
    id: number;
    actor_id: number | null;
    actor_name: string | null;
    actor_email: string | null;
    event: string;
    description: string | null;
    module: string;
    subject_type: string | null;
    subject_id: number | null;
    method: string | null;
    url: string | null;
    ip_address: string | null;
    user_agent: string | null;
    metadata: Record<string, unknown> | null;
    request_id: string | null;
    created_at: string | null;
}

export interface SerpFetch {
    url: string;
    country: string | null;
    created_at: string;
}

export interface PaginatedData<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface SiteSettings {
    general: Record<string, string | null>;
    branding: Record<string, string | null>;
    social: Record<string, string | null>;
    mail: Record<string, string | number | null>;
    analytics: Record<string, string | null>;
}

export interface DashboardStats {
    summary: {
        page_views: number;
        unique_sessions: number;
        serp_fetches: number;
    };
    visits: { date: string; views: number }[];
    devices: { device: string; sessions: number }[];
    topCountries: { country: string; views: number }[];
    topPages: { path: string; views: number }[];
    serpFetches: { date: string; fetches: number }[];
}

export interface PageProps extends InertiaPageProps {
    app: {
        name: string;
        url: string;
        env: string;
    };
    branding: {
        site_name: string;
        tagline: string;
        logo_path: string | null;
        favicon_path: string | null;
        primary_color: string;
    };
    auth: {
        user: AdminUser | null;
    };
    flash: {
        success?: string;
        error?: string;
    };
}
