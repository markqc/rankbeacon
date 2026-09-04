import Container from '../../components/Container';
import LinkButton from '../../components/LinkButton';
import SectionHeading from '../../components/SectionHeading';
import MainLayout from '../../layouts/MainLayout';

export default function Error500() {
    return (
        <MainLayout title="Something went wrong" description="We are unable to show this page right now.">
            <Container className="py-16 lg:py-24">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-6xl font-bold text-navy-950" aria-hidden="true">
                        500
                    </p>
                    <SectionHeading
                        title="Something went wrong"
                        subtitle="We encountered an unexpected error while loading this page. Please try again in a moment."
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
