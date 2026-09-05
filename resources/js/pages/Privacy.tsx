import Container from '../components/Container';
import LinkButton from '../components/LinkButton';
import SectionHeading from '../components/SectionHeading';
import MainLayout from '../layouts/MainLayout';

const EFFECTIVE_DATE = 'September 5, 2026';
const LAST_UPDATED = 'September 5, 2026';

const h2Class = 'mt-8 text-2xl font-bold text-navy-950';
const h3Class = 'mt-6 text-xl font-bold text-navy-950';
const listClass = 'list-disc space-y-1 pl-6';

export default function Privacy() {
    return (
        <MainLayout
            title="Privacy Policy"
            description="Learn how RankBeacon processes limited technical information, protects tool inputs, and avoids advertising or marketing use."
            robots="index,follow"
        >
            <Container className="py-12 lg:py-16">
                <article className="max-w-4xl">
                    <SectionHeading
                        title="Privacy Policy"
                        subtitle={`Effective date: ${EFFECTIVE_DATE} · Last updated: ${LAST_UPDATED}`}
                        as="h1"
                    />

                    <div className="rounded-lg border border-slate-200 bg-pale-50 p-5 text-slate-700">
                        RankBeacon does not require an account and does not collect or use your information for
                        advertising or marketing. Limited technical data may be processed to operate, secure, and
                        improve the service.
                    </div>

                    <div className="mt-8 space-y-5 leading-relaxed text-slate-700">
                        <h2 className={h2Class}>1. About RankBeacon</h2>
                        <p>
                            RankBeacon is a free SEO tool provided by Authority Lighthouse. It helps users preview how a
                            webpage may appear in search results and review basic page metadata.
                        </p>
                        <p>
                            You can use the public SERP Preview tool without creating an account, registering,
                            subscribing, or providing your name or email address.
                        </p>

                        <h2 className={h2Class}>2. Our privacy approach</h2>
                        <p>
                            RankBeacon is designed to collect as little information as reasonably necessary to operate,
                            protect, and improve the service.
                        </p>
                        <p>
                            We do not collect personal information for advertising or marketing. We do not use tool
                            inputs or usage information to build marketing profiles, send promotional messages, perform
                            remarketing, or generate sales leads. We do not sell or rent user information.
                        </p>

                        <h2 className={h2Class}>3. Information processed when you use the tool</h2>
                        <h3 className={h3Class}>Information you enter</h3>
                        <p>
                            When using the SERP Preview tool, you may manually enter a webpage title, description, and
                            URL. This information is processed only to generate the preview and provide the tool&rsquo;s
                            requested functions.
                        </p>
                        <p>
                            RankBeacon does not intentionally use this content for advertising or marketing. Do not
                            enter passwords, private account information, confidential business information, personal
                            records, or sensitive personal information into the tool.
                        </p>
                        <h3 className={h3Class}>Fetch Page feature</h3>
                        <p>
                            If you use <strong className="text-navy-950">Fetch Page</strong>, RankBeacon sends a
                            server-side request to the URL you provide so it can retrieve publicly available page
                            metadata, such as the title, meta description, canonical URL, robots directives, and HTTP
                            status.
                        </p>
                        <p>
                            The owner or hosting provider of the submitted website may receive technical request
                            information from RankBeacon&rsquo;s server as part of this connection. RankBeacon does not
                            log in to the submitted website, bypass access controls, or intentionally retrieve private
                            content.
                        </p>
                        <p>
                            Submitted URLs are sanitized where practical. Credentials, URL fragments, and sensitive
                            query parameters should not be stored in analytics records.
                        </p>

                        <h2 className={h2Class}>4. Limited technical and usage information</h2>
                        <p>
                            RankBeacon may process limited technical information needed to operate, secure,
                            troubleshoot, and understand the general use of the service. This may include:
                        </p>
                        <ul className={listClass}>
                            <li>pages viewed;</li>
                            <li>approximate visit or session information;</li>
                            <li>general referral source;</li>
                            <li>browser, operating-system, and device category;</li>
                            <li>approximate country, when available without collecting precise location;</li>
                            <li>
                                interactions with the SERP Preview tool, such as opening the tool, using Fetch Page,
                                changing preview mode, copying a result, or resetting the form;
                            </li>
                            <li>
                                server logs containing information such as timestamps, request paths, IP addresses, user
                                agents, errors, and security events.
                            </li>
                        </ul>
                        <p>
                            Where reasonably possible, analytics use anonymous or privacy-safe identifiers. RankBeacon
                            does not use browser fingerprinting. Tool analytics should not store the complete title or
                            description entered by a user. URLs used for reporting should be minimized or sanitized to
                            avoid retaining credentials, fragments, and sensitive query values.
                        </p>
                        <p>This information is used only to:</p>
                        <ul className={listClass}>
                            <li>deliver and maintain RankBeacon;</li>
                            <li>measure general traffic and feature usage;</li>
                            <li>diagnose errors and improve reliability;</li>
                            <li>prevent abuse, automated attacks, and misuse;</li>
                            <li>understand which public pages and tool functions are useful.</li>
                        </ul>
                        <p>
                            It is not used for advertising, direct marketing, remarketing, or the creation of marketing
                            profiles.
                        </p>

                        <h2 className={h2Class}>5. Cookies and local storage</h2>
                        <p>
                            RankBeacon may use strictly necessary cookies or local storage for security, session
                            handling, user-interface preferences, and anonymous analytics operation.
                        </p>
                        <p>
                            RankBeacon does not use advertising cookies. If non-essential analytics cookies are
                            introduced later, this policy and the application&rsquo;s consent controls must be updated
                            before they are enabled.
                        </p>

                        <h2 className={h2Class}>6. How information is shared</h2>
                        <p>RankBeacon does not sell or rent information.</p>
                        <p>
                            Limited information may be processed by infrastructure providers that help host, secure,
                            monitor, or deliver the service. Information may also be disclosed when reasonably necessary
                            to comply with applicable law, respond to a valid legal request, protect the service or its
                            users, investigate abuse, or enforce the Terms of Use.
                        </p>
                        <p>
                            Service providers should receive only the information required to perform their functions
                            and should not be authorized to use it for their own advertising or marketing.
                        </p>

                        <h2 className={h2Class}>7. Data retention</h2>
                        <p>
                            Tool inputs should be processed only for as long as needed to provide the requested preview
                            or metadata result, unless temporary retention is required to investigate an error, prevent
                            abuse, or meet a legal obligation.
                        </p>
                        <p>
                            Analytics, aggregated statistics, and security logs are retained only for a reasonable
                            operational period defined in RankBeacon&rsquo;s system configuration. Data should be
                            aggregated, anonymized, or deleted when it is no longer required for the purposes described
                            in this policy.
                        </p>

                        <h2 className={h2Class}>8. Data security</h2>
                        <p>
                            Authority Lighthouse uses reasonable administrative and technical safeguards intended to
                            protect RankBeacon and the limited information it processes. No online service can guarantee
                            absolute security.
                        </p>

                        <h2 className={h2Class}>9. Children&rsquo;s privacy</h2>
                        <p>
                            RankBeacon is a general SEO utility and is not directed to children. We do not knowingly
                            request or collect personal information from children through the public tool.
                        </p>

                        <h2 className={h2Class}>10. External websites</h2>
                        <p>
                            RankBeacon may contain links to external websites. The Fetch Page feature may also connect
                            to a URL selected by the user. Authority Lighthouse does not control the privacy, content,
                            availability, or security practices of third-party websites.
                        </p>

                        <h2 className={h2Class}>11. Your privacy choices and requests</h2>
                        <p>
                            Because the public tool does not require an account and is designed not to collect directly
                            identifying profile information, RankBeacon may not be able to connect anonymous analytics
                            information to a particular person.
                        </p>
                        <p>
                            You may contact Authority Lighthouse through the contact method published on{' '}
                            <a
                                href="https://authoritylighthouse.com/"
                                className="text-teal-600 underline hover:text-teal-700"
                            >
                                authoritylighthouse.com
                            </a>{' '}
                            with a privacy question or request. We may need enough information to understand and
                            reasonably verify the request, but we will not ask for unnecessary personal information.
                        </p>

                        <h2 className={h2Class}>12. Changes to this policy</h2>
                        <p>
                            This Privacy Policy may be updated when RankBeacon&rsquo;s features or data practices
                            change. The updated version will be posted on this page with a revised &ldquo;Last
                            updated&rdquo; date. Material changes to data use should be explained clearly before or when
                            they take effect.
                        </p>

                        <h2 className={h2Class}>13. Contact</h2>
                        <p>
                            For questions about this Privacy Policy or RankBeacon&rsquo;s data practices, contact
                            Authority Lighthouse through{' '}
                            <a
                                href="https://authoritylighthouse.com/"
                                className="text-teal-600 underline hover:text-teal-700"
                            >
                                authoritylighthouse.com
                            </a>
                            .
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <LinkButton href="/terms" variant="outline" size="md">
                                Read Terms of Use
                            </LinkButton>
                            <LinkButton href="/" variant="ghost" size="md">
                                Back home
                            </LinkButton>
                        </div>
                    </div>
                </article>
            </Container>
        </MainLayout>
    );
}
