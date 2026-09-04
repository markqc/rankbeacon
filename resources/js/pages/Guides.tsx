import { Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Monitor, Search, Smartphone } from 'lucide-react';
import Container from '../components/Container';
import LinkButton from '../components/LinkButton';
import SectionHeading from '../components/SectionHeading';
import MainLayout from '../layouts/MainLayout';

export default function Guides() {
    return (
        <MainLayout
            title="SERP Title & Description Guide"
            description="How to write Google search titles and descriptions that are clear, accurate, and fit within search result limits."
        >
            <Container className="py-12 lg:py-16">
                <SectionHeading
                    title="SERP titles and descriptions"
                    subtitle="A practical guide to writing search snippets that accurately represent your page and fit within Google’s display limits."
                    as="h1"
                />

                <article className="max-w-3xl space-y-6 text-slate-700">
                    <p className="text-lg leading-relaxed">
                        When someone searches for a topic on Google, the result is made up of a{' '}
                        <strong className="text-navy-950">title link</strong>, a{' '}
                        <strong className="text-navy-950">URL line</strong> with the site name and breadcrumb, and a{' '}
                        <strong className="text-navy-950">description</strong> pulled from the page. These three
                        elements are usually what people see first, so they should be clear, honest, and specific.
                    </p>

                    <h2 className="text-2xl font-bold text-navy-950">What matters most</h2>

                    <ul className="space-y-3 leading-relaxed">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" aria-hidden="true" />
                            <span>
                                <strong className="text-navy-950">Relevance</strong> — the title and description should
                                summarize the specific content of the page, not the whole site.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" aria-hidden="true" />
                            <span>
                                <strong className="text-navy-950">Clarity</strong> — front-load the most important words
                                and avoid vague filler like “Welcome to our website.”
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" aria-hidden="true" />
                            <span>
                                <strong className="text-navy-950">Accuracy</strong> — the description should not promise
                                content the page does not deliver.
                            </span>
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold text-navy-950">Width, not just character count</h2>
                    <p className="leading-relaxed">
                        Google measures titles and descriptions by <strong className="text-navy-950">pixels</strong>,
                        not only characters. A wide character like “W” takes more space than “i”, so a 60-character
                        title may still be truncated. The RankBeacon SERP Preview estimates this in the browser canvas
                        and shows you where a title is likely to be cut off.
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-pale-50 p-4">
                            <div className="mb-2 flex items-center gap-2 font-semibold text-navy-950">
                                <Monitor className="h-5 w-5" aria-hidden="true" />
                                Desktop
                            </div>
                            <p className="text-sm leading-relaxed text-slate-700">
                                Titles usually fit around 580 pixels before truncation. Descriptions wrap to two lines.
                            </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-pale-50 p-4">
                            <div className="mb-2 flex items-center gap-2 font-semibold text-navy-950">
                                <Smartphone className="h-5 w-5" aria-hidden="true" />
                                Mobile
                            </div>
                            <p className="text-sm leading-relaxed text-slate-700">
                                Titles fit around 340 pixels. Descriptions wrap to four lines, so the total visible
                                length is still fairly short.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-navy-950">Common mistakes</h2>
                    <ul className="space-y-3 leading-relaxed">
                        <li className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" aria-hidden="true" />
                            <span>Keyword stuffing that makes the title hard to read.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" aria-hidden="true" />
                            <span>Writing a description that is just a list of keywords.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" aria-hidden="true" />
                            <span>Using the same title and description on every page of a site.</span>
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold text-navy-950">Try it</h2>
                    <p className="leading-relaxed">
                        Paste a URL into the{' '}
                        <Link href="/tools/serp-preview" className="font-medium text-blue-700 hover:underline">
                            SERP Preview tool
                        </Link>{' '}
                        to see how the live metadata looks, or type your own title and description to compare desktop
                        and mobile results.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <LinkButton href="/tools/serp-preview" size="lg">
                            <Search className="mr-2 h-5 w-5" aria-hidden="true" />
                            Open SERP Preview
                        </LinkButton>
                        <LinkButton href="/tools" variant="outline" size="lg">
                            Back to tools
                        </LinkButton>
                    </div>
                </article>
            </Container>
        </MainLayout>
    );
}
