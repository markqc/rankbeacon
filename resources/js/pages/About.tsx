import { Code, Lightbulb, Shield, Users } from 'lucide-react';
import Container from '../components/Container';
import LinkButton from '../components/LinkButton';
import SectionHeading from '../components/SectionHeading';
import MainLayout from '../layouts/MainLayout';

export default function About() {
    return (
        <MainLayout
            title="About RankBeacon"
            description="RankBeacon is a modular SEO tools platform built by Authority Lighthouse and developed by MCaneda.com."
        >
            <Container className="py-12 lg:py-16">
                <SectionHeading
                    title="About RankBeacon"
                    subtitle="A focused platform for search-result previews and metadata clarity."
                    as="h1"
                />

                <div className="max-w-3xl space-y-5 leading-relaxed text-slate-700">
                    <p>
                        RankBeacon is a modular SEO tools platform by Authority Lighthouse. It is built for marketers,
                        developers, and business owners who want practical, accurate tools for understanding how their
                        pages appear in search and social sharing.
                    </p>

                    <p>
                        The platform is being developed by MCaneda.com. Each tool is designed to solve one problem well,
                        starting with the Google SERP Preview, which lets you fetch live page metadata and compare
                        desktop and mobile search snippets.
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-navy-950">Why we are building it</h2>
                    <p>
                        SEO tools are often cluttered or over-promise what they can control. RankBeacon takes a
                        different approach: clear estimates, honest disclaimers, and metadata that is easy to preview
                        and edit. We focus on what you can actually influence—titles, descriptions, site names,
                        breadcrumbs, and the visual signals searchers see before they click.
                    </p>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-pale-50 p-5">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                                <Lightbulb className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="font-semibold text-navy-950">Clarity first</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Every tool explains what it does, what it cannot do, and what the preview really
                                represents.
                            </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-pale-50 p-5">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                                <Shield className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="font-semibold text-navy-950">Safety by default</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                URL fetches are validated, resolved, and pinned on the server to avoid SSRF and
                                mixed-content risks.
                            </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-pale-50 p-5">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                                <Code className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="font-semibold text-navy-950">Modular design</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Each tool is independent, typed, and tested. New tools can be added without rewriting
                                the whole application.
                            </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-pale-50 p-5">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                                <Users className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h3 className="font-semibold text-navy-950">Built for teams</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                No account needed for basic previews. The interface is keyboard and screen-reader
                                friendly.
                            </p>
                        </div>
                    </div>

                    <h2 className="mt-8 text-2xl font-bold text-navy-950">About the developer</h2>
                    <p>
                        RankBeacon is designed and developed by MCaneda.com as a production-grade learning project under
                        the Authority Lighthouse brand. The codebase is intentionally modular so that each phase can be
                        reviewed, tested, and released independently.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <LinkButton href="/tools/serp-preview" size="md">
                            Try the SERP Preview
                        </LinkButton>
                        <LinkButton href="/guides" variant="outline" size="md">
                            Read the guide
                        </LinkButton>
                    </div>
                </div>
            </Container>
        </MainLayout>
    );
}
