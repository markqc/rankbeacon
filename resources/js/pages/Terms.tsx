import Container from '../components/Container';
import LinkButton from '../components/LinkButton';
import SectionHeading from '../components/SectionHeading';
import MainLayout from '../layouts/MainLayout';

const EFFECTIVE_DATE = 'September 5, 2026';
const LAST_UPDATED = 'September 5, 2026';

const h2Class = 'mt-8 text-2xl font-bold text-navy-950';
const listClass = 'list-disc space-y-1 pl-6';

export default function Terms() {
    return (
        <MainLayout
            title="Terms of Use"
            description="Read the terms that apply when using RankBeacon's SEO preview and webpage metadata tools."
            robots="index,follow"
        >
            <Container className="py-12 lg:py-16">
                <article className="max-w-4xl">
                    <SectionHeading
                        title="Terms of Use"
                        subtitle={`Effective date: ${EFFECTIVE_DATE} · Last updated: ${LAST_UPDATED}`}
                        as="h1"
                    />

                    <div className="rounded-lg border border-slate-200 bg-pale-50 p-5 text-slate-700">
                        RankBeacon is an informational SEO preview tool. Its previews and checks are estimates and do
                        not guarantee how a search engine will display or rank a webpage.
                    </div>

                    <div className="mt-8 space-y-5 leading-relaxed text-slate-700">
                        <h2 className={h2Class}>1. Acceptance of these terms</h2>
                        <p>
                            These Terms of Use apply to your access to and use of RankBeacon, an SEO tool provided by
                            Authority Lighthouse. By using RankBeacon, you agree to these terms. If you do not agree, do
                            not use the service.
                        </p>

                        <h2 className={h2Class}>2. Description of the service</h2>
                        <p>
                            RankBeacon provides tools that may help users preview search-result appearances, review
                            publicly available webpage metadata, and understand basic SEO presentation.
                        </p>
                        <p>
                            RankBeacon provides estimates and simulations only. A preview is not an exact reproduction
                            or guarantee of how Google or another search engine will display, index, rank, truncate,
                            rewrite, or otherwise process a webpage.
                        </p>

                        <h2 className={h2Class}>3. No account required</h2>
                        <p>
                            The public RankBeacon SERP Preview tool may be used without creating an account. Authority
                            Lighthouse may add optional or restricted features in the future. Any additional terms
                            presented for those features will apply when they are introduced.
                        </p>

                        <h2 className={h2Class}>4. Permitted use</h2>
                        <p>
                            You may use RankBeacon for lawful SEO review, testing, research, education, and
                            website-management purposes.
                        </p>
                        <p>
                            You are responsible for the URLs and content you submit and for ensuring that your use of
                            the service is lawful and does not violate another person&rsquo;s rights.
                        </p>

                        <h2 className={h2Class}>5. Prohibited use</h2>
                        <p>You must not use RankBeacon to:</p>
                        <ul className={listClass}>
                            <li>break any applicable law or regulation;</li>
                            <li>
                                access or attempt to access private, restricted, or unauthorized systems or content;
                            </li>
                            <li>
                                bypass authentication, security controls, robots restrictions, rate limits, or technical
                                protections;
                            </li>
                            <li>
                                probe internal networks, localhost, private IP addresses, cloud metadata services, or
                                infrastructure not intended for public access;
                            </li>
                            <li>submit malicious URLs, code, files, or payloads;</li>
                            <li>
                                interfere with, overload, scrape excessively, disrupt, or damage RankBeacon or its
                                infrastructure;
                            </li>
                            <li>automate high-volume requests without written permission;</li>
                            <li>misrepresent RankBeacon output as an official search-engine result or guarantee;</li>
                            <li>infringe intellectual-property, privacy, confidentiality, or other rights;</li>
                            <li>
                                copy, resell, sublicense, or commercially reproduce a substantial part of the service
                                itself without permission.
                            </li>
                        </ul>
                        <p>
                            Authority Lighthouse may restrict or block activity that appears abusive, unsafe, unlawful,
                            or harmful to the service or other users.
                        </p>

                        <h2 className={h2Class}>6. Submitted URLs and content</h2>
                        <p>
                            You retain responsibility for any URL, title, description, or other content you submit. You
                            grant Authority Lighthouse only the limited permission necessary to process that information
                            and provide the requested RankBeacon function.
                        </p>
                        <p>
                            You should submit only public URLs that you are authorized to review. Do not submit
                            passwords, access tokens, personal records, confidential information, or sensitive personal
                            information.
                        </p>

                        <h2 className={h2Class}>7. Third-party websites and services</h2>
                        <p>
                            RankBeacon may retrieve public metadata from or link to third-party websites. Authority
                            Lighthouse does not own, operate, endorse, or control those websites and is not responsible
                            for their content, security, availability, accuracy, or practices.
                        </p>
                        <p>
                            Search-engine names, result formats, and other third-party references belong to their
                            respective owners. RankBeacon is an independent tool unless expressly stated otherwise and
                            is not endorsed by or affiliated with Google or another search engine.
                        </p>

                        <h2 className={h2Class}>8. Accuracy and SEO results</h2>
                        <p>
                            RankBeacon is provided as a practical preview and informational tool. Search engines may
                            change their layouts, measurement rules, indexing systems, and result-generation behavior at
                            any time.
                        </p>
                        <p>Authority Lighthouse does not guarantee:</p>
                        <ul className={listClass}>
                            <li>that a preview will match a live search result;</li>
                            <li>that a search engine will use the submitted title or description;</li>
                            <li>indexing, ranking, visibility, traffic, leads, revenue, or other SEO outcomes;</li>
                            <li>
                                the accuracy, completeness, or continued availability of fetched metadata or warnings.
                            </li>
                        </ul>
                        <p>
                            You should independently review important SEO, publishing, security, and business decisions.
                        </p>

                        <h2 className={h2Class}>9. Availability and changes</h2>
                        <p>
                            RankBeacon may be updated, limited, suspended, or discontinued at any time. Features may
                            change as search engines, technical requirements, security needs, or the product itself
                            evolve.
                        </p>
                        <p>Authority Lighthouse does not guarantee uninterrupted or error-free availability.</p>

                        <h2 className={h2Class}>10. Intellectual property</h2>
                        <p>
                            RankBeacon&rsquo;s name, branding, interface, original code, documentation, graphics, and
                            other original materials are owned by Authority Lighthouse or their respective licensors and
                            are protected by applicable intellectual-property laws.
                        </p>
                        <p>
                            These terms do not transfer ownership of RankBeacon or grant permission to use Authority
                            Lighthouse or RankBeacon branding except as necessary to identify the service.
                        </p>

                        <h2 className={h2Class}>11. Disclaimer</h2>
                        <p>
                            RankBeacon is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To
                            the extent permitted by applicable law, Authority Lighthouse disclaims warranties of
                            merchantability, fitness for a particular purpose, non-infringement, accuracy, availability,
                            and error-free operation.
                        </p>
                        <p>RankBeacon does not provide legal, financial, or guaranteed SEO advice.</p>

                        <h2 className={h2Class}>12. Limitation of liability</h2>
                        <p>
                            To the extent permitted by applicable law, Authority Lighthouse will not be liable for
                            indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of
                            data, rankings, traffic, revenue, profit, opportunity, reputation, or business arising from
                            or related to the use of or inability to use RankBeacon.
                        </p>
                        <p>
                            Where liability cannot lawfully be excluded, it will be limited to the minimum extent
                            permitted by applicable law.
                        </p>

                        <h2 className={h2Class}>13. Indemnity</h2>
                        <p>
                            To the extent permitted by applicable law, you agree to be responsible for claims, losses,
                            or expenses arising from your unlawful use of RankBeacon, your violation of these terms, or
                            your infringement of another person&rsquo;s rights.
                        </p>

                        <h2 className={h2Class}>14. Enforcement and termination</h2>
                        <p>
                            Authority Lighthouse may limit, suspend, or block access when reasonably necessary to
                            protect RankBeacon, investigate abuse, comply with legal obligations, or enforce these
                            terms.
                        </p>
                        <p>
                            Sections that by their nature should continue after access ends&mdash;including intellectual
                            property, disclaimers, liability limitations, and responsibility for misuse&mdash;will
                            continue to apply.
                        </p>

                        <h2 className={h2Class}>15. Changes to these terms</h2>
                        <p>
                            These Terms of Use may be updated when RankBeacon&rsquo;s services or requirements change.
                            The updated terms will be posted on this page with a revised &ldquo;Last updated&rdquo;
                            date. Continued use after an update means you accept the revised terms.
                        </p>

                        <h2 className={h2Class}>16. General terms</h2>
                        <p>
                            If any provision is found unenforceable, the remaining provisions will continue to apply. A
                            failure to enforce a provision is not a waiver of the right to enforce it later.
                        </p>

                        <h2 className={h2Class}>17. Contact</h2>
                        <p>
                            For questions about these Terms of Use, contact Authority Lighthouse through{' '}
                            <a
                                href="https://authoritylighthouse.com/"
                                className="text-teal-600 underline hover:text-teal-700"
                            >
                                authoritylighthouse.com
                            </a>
                            .
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
                </article>
            </Container>
        </MainLayout>
    );
}
