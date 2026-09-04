import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import PageHead from '../components/PageHead';
import SkipLink from '../components/SkipLink';
import type { PageProps } from '../types';

interface Props {
    children: ReactNode;
    title: string;
    description?: string;
    canonicalUrl?: string;
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

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans antialiased text-slate-900">
            <PageHead
                title={title}
                description={description}
                canonicalUrl={resolvedCanonical}
                ogTitle={ogTitle}
                ogDescription={ogDescription}
                ogImage={ogImage}
                ogType={ogType}
                jsonLd={jsonLd}
            />
            <SkipLink />
            <Header currentUrl={url} />
            <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
                {children}
            </main>
            <Footer />
        </div>
    );
}
