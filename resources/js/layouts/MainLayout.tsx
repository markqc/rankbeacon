import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import PageHead from '../components/PageHead';
import SkipLink from '../components/SkipLink';
import { useAnalytics } from '../hooks/useAnalytics';
import { useFavicon } from '../hooks/useFavicon';
import type { PageProps } from '../types';

interface Props {
    children: ReactNode;
    title: string;
    description?: string;
    canonicalUrl?: string;
    robots?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    jsonLd?: Record<string, unknown>;
}

export default function MainLayout({
    children,
    title,
    description,
    canonicalUrl,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    jsonLd,
}: Props) {
    const { url, props } = usePage<PageProps>();
    const baseUrl = props.app.url.replace(/\/$/, '');
    const path = url.split('?')[0];
    const resolvedCanonical = canonicalUrl ?? `${baseUrl}${path}`;

    useAnalytics(path);
    useFavicon(props.branding.favicon_path);

    const { site_name: siteName, tagline } = props.branding;

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans antialiased text-slate-900">
            <PageHead
                title={title}
                description={description}
                canonicalUrl={resolvedCanonical}
                robots={robots}
                ogTitle={ogTitle}
                ogDescription={ogDescription}
                ogImage={ogImage}
                ogType={ogType}
                jsonLd={jsonLd}
            />
            <SkipLink />
            <Header currentUrl={url} siteName={siteName} tagline={tagline} />
            <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
                {children}
            </main>
            <Footer />
        </div>
    );
}
