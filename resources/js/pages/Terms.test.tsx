import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Terms from './Terms';

let headProps: { title?: string; children?: ReactNode } = {};

vi.mock('@inertiajs/react', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Head: (props: any) => {
        headProps = props;
        return <>{props.children}</>;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link: (props: any) => {
        const { children, ...rest } = props;
        return <a {...rest}>{children}</a>;
    },
    usePage: () => ({
        url: '/terms',
        props: {
            app: {
                url: 'http://localhost:8000',
                name: 'RankBeacon',
                env: 'testing',
            },
            branding: {
                site_name: 'RankBeacon',
                tagline: 'SEO Tools by Authority Lighthouse',
                logo_path: null,
                favicon_path: null,
                primary_color: '#0f172a',
            },
        },
    }),
}));

describe('Terms page', () => {
    it('renders the approved title, dates, and provider name', () => {
        render(<Terms />);

        expect(screen.getByRole('heading', { level: 1, name: 'Terms of Use' })).toBeInTheDocument();
        expect(screen.getByText(/Effective date: September 5, 2026/)).toBeInTheDocument();
        expect(screen.getByText(/Last updated: September 5, 2026/)).toBeInTheDocument();
        expect(screen.getAllByText(/Authority Lighthouse/).length).toBeGreaterThan(0);
    });

    it('renders the summary panel and all 17 sections', () => {
        render(<Terms />);

        expect(screen.getByText(/previews and checks are estimates and do not guarantee/)).toBeInTheDocument();

        const sections = screen.getAllByRole('heading', { level: 2 });
        expect(sections.length).toBe(17);
        expect(sections[0]).toHaveTextContent('1. Acceptance of these terms');
        expect(sections[16]).toHaveTextContent('17. Contact');
    });

    it('states that no account is required and links to the privacy policy', () => {
        render(<Terms />);

        expect(screen.getByText(/may be used without creating an account/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Read Privacy Policy' })).toHaveAttribute('href', '/privacy');
    });

    it('sets metadata and canonical for /terms', () => {
        render(<Terms />);

        expect(headProps.title).toBe('Terms of Use');
        expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
            'content',
            "Read the terms that apply when using RankBeacon's SEO preview and webpage metadata tools.",
        );
        expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
        expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'http://localhost:8000/terms');
    });

    it('contains no legal-review or draft disclaimers', () => {
        render(<Terms />);

        expect(screen.queryByText(/legal review/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/draft/i)).not.toBeInTheDocument();
    });
});
