import Alert from '../components/Alert';
import Container from '../components/Container';
import LinkButton from '../components/LinkButton';
import SectionHeading from '../components/SectionHeading';
import MainLayout from '../layouts/MainLayout';

export default function Terms() {
    return (
        <MainLayout
            title="Terms of Service"
            description="Terms of service, acceptable use, and disclaimers for RankBeacon."
        >
            <Container className="py-12 lg:py-16">
                <SectionHeading title="Terms of Service" subtitle="Last updated: January 2026" as="h1" />

                <Alert variant="warning" title="Legal review needed" className="mb-8 max-w-3xl">
                    This terms page is a pre-launch draft. It must be reviewed by a qualified legal professional before
                    the site is made public or used for business purposes.
                </Alert>

                <div className="max-w-3xl space-y-5 leading-relaxed text-slate-700">
                    <p>
                        By using RankBeacon, you agree to the following terms. If you do not agree, please do not use
                        the site or its tools.
                    </p>

                    <h2 className="text-xl font-bold text-navy-950">Acceptable use</h2>
                    <p>
                        RankBeacon is intended for legitimate SEO, development, and marketing purposes. You agree not to
                        use the tools to attack, scan, or access private networks, internal services, or any endpoint
                        you do not have permission to request. The URL fetcher is restricted to public http/https URLs
                        and rejects private, loopback, and reserved addresses.
                    </p>

                    <h2 className="text-xl font-bold text-navy-950">Disclaimer of results</h2>
                    <p>
                        The SERP Preview and any other search-related previews are{' '}
                        <strong className="text-navy-950">estimates only</strong>. Google and other search engines may
                        rewrite titles, descriptions, and site names based on their own algorithms, user context, and
                        query intent. RankBeacon does not guarantee any specific search ranking, indexing status,
                        click-through rate, or placement.
                    </p>

                    <h2 className="text-xl font-bold text-navy-950">Preview accuracy</h2>
                    <p>
                        Pixel-width measurements are generated in the browser canvas and may differ from the actual
                        rendering in a live search result. Factors such as operating system, browser version, font
                        availability, device scale, and Google’s own rendering pipeline can all affect the final
                        display.
                    </p>

                    <h2 className="text-xl font-bold text-navy-950">No legal or financial advice</h2>
                    <p>
                        Nothing on this site constitutes legal, financial, or professional SEO advice. The guides and
                        tools are provided for informational purposes only. Always consult a qualified professional for
                        decisions that affect your business or legal obligations.
                    </p>

                    <h2 className="text-xl font-bold text-navy-950">Availability</h2>
                    <p>
                        We do not guarantee that the site or any tool will be available at all times. Rate limits,
                        maintenance, and technical issues may affect access. Tools marked “coming soon” are not
                        functional and may not be available in the final release.
                    </p>

                    <h2 className="text-xl font-bold text-navy-950">Limitation of liability</h2>
                    <p>
                        To the maximum extent permitted by applicable law, RankBeacon and its developer are not liable
                        for any damages arising from the use or inability to use the tools, including but not limited to
                        errors in search rankings, data loss, or business interruption.
                    </p>

                    <h2 className="text-xl font-bold text-navy-950">Changes</h2>
                    <p>
                        These terms may change as the platform grows. Continued use after changes are posted means you
                        accept the updated terms.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <LinkButton href="/privacy" variant="outline" size="md">
                            Read Privacy Policy
                        </LinkButton>
                        <LinkButton href="/" variant="ghost" size="md">
                            Back home
                        </LinkButton>
                    </div>
                </div>
            </Container>
        </MainLayout>
    );
}
