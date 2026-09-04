import Container from '../../components/Container';
import SectionHeading from '../../components/SectionHeading';
import SerpPreviewTool from '../../features/serp-preview/SerpPreviewTool';
import MainLayout from '../../layouts/MainLayout';

export default function SerpPreview() {
    return (
        <MainLayout
            title="SERP Preview"
            description="Preview how your page title, URL, and meta description appear in Google search results."
        >
            <div className="py-12">
                <Container>
                    <SectionHeading
                        title="Google SERP Preview"
                        subtitle="Edit the fields to see a live estimate of your search result."
                        as="h1"
                    />
                    <div className="mt-8">
                        <SerpPreviewTool />
                    </div>
                </Container>
            </div>
        </MainLayout>
    );
}
