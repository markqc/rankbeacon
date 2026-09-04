import { FileText, Link as LinkIcon, Search, Share2, Smartphone, Tags } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import Container from '../../components/Container';
import LinkButton from '../../components/LinkButton';
import SectionHeading from '../../components/SectionHeading';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import MainLayout from '../../layouts/MainLayout';

interface Tool {
    title: string;
    description: string;
    icon: LucideIcon;
    status: 'available' | 'coming-soon';
    href?: string;
    cta?: string;
}

const tools: Tool[] = [
    {
        title: 'Google SERP Preview',
        description:
            'Enter your URL to fetch live metadata, or type your title and description directly to see an estimated Google search result on desktop and mobile.',
        icon: Search,
        status: 'available',
        href: '/tools/serp-preview',
        cta: 'Open SERP Preview',
    },
    {
        title: 'Meta Tag Checker',
        description: 'Validate title, description, viewport, and other key tags. Planned for a future release.',
        icon: Tags,
        status: 'coming-soon',
    },
    {
        title: 'Robots.txt Tester',
        description: 'Check how crawlers read your robots.txt rules before publishing. Planned for a future release.',
        icon: FileText,
        status: 'coming-soon',
    },
    {
        title: 'Open Graph Preview',
        description: 'See how links look when shared on social platforms. Planned for a future release.',
        icon: Share2,
        status: 'coming-soon',
    },
    {
        title: 'Mobile Preview Suite',
        description: 'Compare search snippets across more device sizes and form factors. Planned for a future release.',
        icon: Smartphone,
        status: 'coming-soon',
    },
    {
        title: 'Internal Link Visualizer',
        description:
            'Explore how pages connect and identify orphan or over-linked pages. Planned for a future release.',
        icon: LinkIcon,
        status: 'coming-soon',
    },
];

export default function ToolsIndex() {
    useScrollReveal();

    return (
        <MainLayout
            title="SEO Tools Directory"
            description="Explore the available RankBeacon SEO tools and see what is coming next."
        >
            <Container className="py-12 lg:py-16">
                <SectionHeading
                    title="SEO tools"
                    subtitle="A focused set of tools for search result previews and metadata. The first tool is live; more are on the roadmap."
                    as="h1"
                />

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger="true">
                    {tools.map(({ title, description, icon: Icon, status, href, cta }) => (
                        <Card key={title} className={`flex flex-col ${status === 'coming-soon' ? 'opacity-80' : ''}`}>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pale-50 text-navy-950">
                                <Icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <h2 className="text-lg font-semibold text-navy-950">{title}</h2>
                            <p className="mt-2 flex-1 text-sm text-slate-600">{description}</p>
                            <div className="mt-4 flex items-center justify-between">
                                <Badge tone={status === 'available' ? 'success' : 'neutral'}>
                                    {status === 'available' ? 'Available' : 'Coming soon'}
                                </Badge>
                                {status === 'available' && href && cta && (
                                    <LinkButton href={href} size="sm">
                                        {cta}
                                    </LinkButton>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </Container>
        </MainLayout>
    );
}
