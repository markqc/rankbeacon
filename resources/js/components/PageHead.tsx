import { Head } from '@inertiajs/react';

interface Props {
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

export default function PageHead({
    title,
    description,
    canonicalUrl,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = 'website',
    jsonLd,
}: Props) {
    return (
        <Head title={title}>
            {description && <meta name="description" content={description} />}
            <meta name="theme-color" content="#10233F" />

            {robots && <meta name="robots" content={robots} />}

            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

            <meta property="og:title" content={ogTitle ?? title} />
            {ogDescription && <meta property="og:description" content={ogDescription} />}
            {ogImage && <meta property="og:image" content={ogImage} />}
            <meta property="og:type" content={ogType} />

            {ogImage && (
                <>
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={ogTitle ?? title} />
                    {ogDescription && <meta name="twitter:description" content={ogDescription} />}
                    <meta name="twitter:image" content={ogImage} />
                </>
            )}

            {jsonLd && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            )}
        </Head>
    );
}
