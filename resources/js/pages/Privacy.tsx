import Alert from '../components/Alert';
import Container from '../components/Container';
import LinkButton from '../components/LinkButton';
import SectionHeading from '../components/SectionHeading';
import MainLayout from '../layouts/MainLayout';

export default function Privacy() {
    return (
        <MainLayout
            title="Privacy Policy"
            description="How RankBeacon collects, processes, and stores data when you use the tools."
        >
            <Container className="py-12 lg:py-16">
                <SectionHeading title="Privacy Policy" subtitle="Last updated: January 2026" as="h1" />

                <div className="max-w-3xl space-y-5 leading-relaxed text-slate-700">
                    <p>
                        RankBeacon is committed to handling data responsibly. This page describes what information is
                        processed when you use the site, how it is used, and how long it is kept.
                    </p>

                    <h2 className="text-xl font-bold text-navy-950">What we process</h2>
                    <p>
                        The SERP Preview and other manual tools collect information only when you enter it into the
                        form. This may include a page URL, site name, breadcrumb, title, meta description, and favicon
                        preference. You can use the SERP Preview without entering any personal information.
                    </p>

                    <h2 className="text-xl font-bold text-navy-950">URL fetching</h2>
                    <p>
                        When you click <strong className="text-navy-950">Fetch Page</strong>, the URL you provide is
                        sent to our server. The server validates the URL, resolves the host, fetches the page, and
                        parses public metadata such as the title and description. We do not forward your cookies,
                        headers, or other identifying information to the target site.
                    </p>

                    <Alert variant="warning" title="Legal review needed" className="my-6">
                        The exact retention period, log format, and whether IP addresses are stored for rate-limit
                        enforcement should be reviewed by a legal or privacy professional before launch.
                    </Alert>

                    <h2 className="text-xl font-bold text-navy-950">Logs</h2>
                    <p>
                        Failed or unsafe fetch attempts are logged with sanitized identifiers so we can detect abuse and
                        diagnose issues. Query strings are intentionally excluded from logs. Successful requests may be
                        cached briefly on the server to improve performance.
                    </p>

                    <h2 className="text-xl font-bold text-navy-950">Caching</h2>
                    <p>
                        Successful metadata fetches are cached for five minutes using the default Laravel cache store.
                        This reduces repeated outbound requests for the same URL. Error and unsafe responses are not
                        cached.
                    </p>

                    <h2 className="text-xl font-bold text-navy-950">Third parties</h2>
                    <p>
                        We do not use advertising trackers or analytics by default. The only external call is the
                        user-initiated URL fetch. Fonts and icons are bundled with the application and are not loaded
                        from external CDN domains.
                    </p>

                    <Alert variant="warning" title="Legal review needed" className="my-6">
                        If analytics, error tracking, or a CDN are added later, this section must be updated and the
                        relevant third-party processors listed here.
                    </Alert>

                    <h2 className="text-xl font-bold text-navy-950">Your rights</h2>
                    <p>
                        Because the site does not require an account, we do not store user profiles or persistent
                        personal data. If you have questions about how data is handled, you can contact the operator.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <LinkButton href="/terms" variant="outline" size="md">
                            Read Terms of Service
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
