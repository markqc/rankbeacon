import Container from '../../components/Container';
import LinkButton from '../../components/LinkButton';
import SectionHeading from '../../components/SectionHeading';
import MainLayout from '../../layouts/MainLayout';

export default function Error404() {
    return (
        <MainLayout title="Page not found" description="The page you requested could not be found.">
            <Container className="py-16 lg:py-24">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-6xl font-bold text-navy-950" aria-hidden="true">
                        404
                    </p>
                    <SectionHeading
                        title="Page not found"
                        subtitle="We could not find the page you were looking for. It may have moved or the address may be incorrect."
                        as="h1"
                    />
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <LinkButton href="/" size="md">
                            Back to home
                        </LinkButton>
                        <LinkButton href="/tools/serp-preview" variant="outline" size="md">
                            Open SERP Preview
                        </LinkButton>
                    </div>
                </div>
            </Container>
        </MainLayout>
    );
}
