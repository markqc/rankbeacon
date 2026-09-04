import { usePage } from '@inertiajs/react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
    Briefcase,
    Code,
    FileText,
    Link as LinkIcon,
    Pencil,
    Search,
    Share2,
    Smartphone,
    Tags,
    UserCheck,
    Users,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Container from '../components/Container';
import LinkButton from '../components/LinkButton';
import SectionHeading from '../components/SectionHeading';
import MainLayout from '../layouts/MainLayout';
import type { PageProps } from '../types';

function HeroPreview({ previewUrl }: { previewUrl: string }) {
    const displayUrl = previewUrl.replace(/^https?:\/\//, '');

    return (
        <Card className="w-full max-w-xl shadow-lg" data-reveal="true">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span className="text-sm text-slate-500">how does my page look in google</span>
            </div>
            <div className="mt-4 space-y-1">
                <p className="text-xs text-slate-500">{displayUrl}</p>
                <p className="text-lg font-medium text-blue-700">SERP Preview — RankBeacon</p>
                <p className="text-sm leading-relaxed text-slate-700">
                    Preview your title and description before searchers see them.
                </p>
                <div className="mt-2 flex gap-3 text-xs text-slate-500">
                    <span>SERP Preview</span>
                    <span>Meta Tags</span>
                </div>
            </div>
        </Card>
    );
}

interface Tool {
    title: string;
    description: string;
    icon: LucideIcon;
    status: 'available' | 'coming-soon';
    href?: string;
}

const tools: Tool[] = [
    {
        title: 'Google SERP Preview',
        description: 'Preview your page title and snippet in search results.',
        icon: Search,
        status: 'available',
        href: '/tools/serp-preview',
    },
    {
        title: 'Meta Tag Checker',
        description: 'Validate title, description, viewport, and other key tags.',
        icon: Tags,
        status: 'coming-soon',
    },
    {
        title: 'Robots.txt Tester',
        description: 'Check how crawlers read your robots.txt rules before publishing.',
        icon: FileText,
        status: 'coming-soon',
    },
    {
        title: 'Open Graph Preview',
        description: 'See how links look when shared on social platforms.',
        icon: Share2,
        status: 'coming-soon',
    },
];

function Step({
    number,
    icon: Icon,
    title,
    description,
    dataReveal,
}: {
    number: string;
    icon: LucideIcon;
    title: string;
    description: string;
    dataReveal?: string;
}) {
    return (
        <li
            className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-6"
            data-reveal={dataReveal}
        >
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <span className="font-bold">{number}</span>
                </div>
                <Icon className="h-6 w-6 text-navy-950" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-navy-950">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
        </li>
    );
}

export default function Home() {
    const { props } = usePage<PageProps>();
    const baseUrl = props.app.url.replace(/\/$/, '');
    const canonicalUrl = `${baseUrl}/`;
    const previewUrl = `${baseUrl}/tools/serp-preview`;
    const description =
        'RankBeacon helps marketers, developers, and business owners preview and improve how their pages appear in Google search results.';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                name: 'Authority Lighthouse',
                url: baseUrl,
                brand: {
                    '@type': 'Brand',
                    name: 'RankBeacon',
                },
            },
            {
                '@type': 'WebSite',
                name: 'RankBeacon',
                url: baseUrl,
                description,
                publisher: {
                    '@type': 'Organization',
                    name: 'Authority Lighthouse',
                },
            },
        ],
    };

    const benefits = [
        {
            icon: UserCheck,
            title: 'No account required',
            description: 'Jump in and preview results without signing up.',
        },
        {
            icon: Zap,
            title: 'Instant live preview',
            description: 'See changes update as you type.',
        },
        {
            icon: Smartphone,
            title: 'Desktop and mobile',
            description: 'Compare search appearances across devices.',
        },
    ];

    const audiences = [
        { icon: Users, label: 'Marketers' },
        { icon: Code, label: 'Developers' },
        { icon: Briefcase, label: 'Business owners' },
    ];

    useScrollReveal();

    return (
        <MainLayout
            title="RankBeacon — SEO Tools by Authority Lighthouse"
            description={description}
            canonicalUrl={canonicalUrl}
            ogDescription={description}
            jsonLd={jsonLd}
        >
            <section className="bg-pale-50 py-16 lg:py-24">
                <Container>
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div className="max-w-2xl" data-reveal="true">
                            <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                                SEO clarity, one tool at a time.
                            </span>
                            <h1 className="mt-4 text-4xl font-bold leading-tight text-navy-950 sm:text-5xl lg:text-6xl">
                                See how your pages appear in search.
                            </h1>
                            <p className="mt-6 text-lg text-slate-700">
                                Practical tools for marketers, developers, and business owners who want accurate search
                                previews, clean metadata, and fewer surprises at launch.
                            </p>
                            <ul className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                                {audiences.map(({ icon: Icon, label }) => (
                                    <li key={label} className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-teal-600" aria-hidden="true" />
                                        {label}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <LinkButton href="/tools/serp-preview" size="lg">
                                    Open SERP Preview
                                </LinkButton>
                                <LinkButton href="/tools" variant="outline" size="lg">
                                    Explore All Tools
                                </LinkButton>
                            </div>
                        </div>
                        <div className="flex justify-center lg:justify-end">
                            <HeroPreview previewUrl={previewUrl} />
                        </div>
                    </div>
                </Container>
            </section>

            <section className="border-y border-slate-200 bg-white py-12">
                <Container>
                    <div className="grid gap-8 sm:grid-cols-3">
                        {benefits.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex items-start gap-4" data-reveal="true">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-navy-950">{title}</h2>
                                    <p className="mt-1 text-sm text-slate-600">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            <section className="py-16 lg:py-24">
                <Container>
                    <SectionHeading
                        title="SEO tools built for results"
                        subtitle="Start with the SERP Preview and watch the platform grow."
                    />
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-reveal-stagger="true">
                        {tools.map(({ title, description, icon: Icon, status, href }) => (
                            <Card
                                key={title}
                                className={`flex flex-col ${status === 'coming-soon' ? 'opacity-80' : ''}`}
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pale-50 text-navy-950">
                                    <Icon className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-semibold text-navy-950">{title}</h3>
                                <p className="mt-2 flex-1 text-sm text-slate-600">{description}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <Badge tone={status === 'available' ? 'success' : 'neutral'}>
                                        {status === 'available' ? 'Available' : 'Coming soon'}
                                    </Badge>
                                    {status === 'available' && href && (
                                        <LinkButton href={href} size="sm">
                                            Open Tool
                                        </LinkButton>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </Container>
            </section>

            <section className="bg-pale-50 py-16 lg:py-24">
                <Container>
                    <SectionHeading
                        title="How it works"
                        subtitle="Get a search-result preview in three simple steps."
                    />
                    <ol className="grid gap-6 sm:grid-cols-3" data-reveal-stagger="true">
                        <Step
                            number="1"
                            icon={LinkIcon}
                            title="Enter your page URL"
                            description="Paste the address you want to preview."
                        />
                        <Step
                            number="2"
                            icon={Pencil}
                            title="Edit title and description"
                            description="Fine-tune your snippet before publishing."
                        />
                        <Step
                            number="3"
                            icon={Smartphone}
                            title="Compare desktop and mobile"
                            description="Switch views to see both search layouts."
                        />
                    </ol>
                </Container>
            </section>

            <section className="bg-navy-950 py-16">
                <Container>
                    <div className="mx-auto max-w-2xl text-center" data-reveal="true">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to see your search preview?</h2>
                        <p className="mt-4 text-slate-300">
                            Open the SERP Preview and compare your title and snippet in seconds.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <LinkButton href="/tools/serp-preview" size="lg">
                                Open SERP Preview
                            </LinkButton>
                            <LinkButton href="/tools" variant="outline" size="lg">
                                Explore All Tools
                            </LinkButton>
                        </div>
                    </div>
                </Container>
            </section>
        </MainLayout>
    );
}
