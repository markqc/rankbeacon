import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Privacy from './Privacy';

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
        url: '/privacy',
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

describe('Privacy page', () => {
    it('renders the approved title, dates, and provider name', () => {
        render(<Privacy />);

        expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
        expect(screen.getByText(/Effective date: September 5, 2026/)).toBeInTheDocument();
        expect(screen.getByText(/Last updated: September 5, 2026/)).toBeInTheDocument();
        expect(screen.getAllByText(/Authority Lighthouse/).length).toBeGreaterThan(0);
    });

    it('renders the summary panel and all 13 sections', () => {
        render(<Privacy />);

        expect(
            screen.getByText(/does not collect or use your information for advertising or marketing/),
        ).toBeInTheDocument();

        const sections = screen.getAllByRole('heading', { level: 2 });
        expect(sections.length).toBe(13);
        expect(sections[0]).toHaveTextContent('1. About RankBeacon');
        expect(sections[12]).toHaveTextContent('13. Contact');
    });

    it('sets metadata and canonical for /privacy', () => {
        render(<Privacy />);

        expect(headProps.title).toBe('Privacy Policy');
        expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
            'content',
            'Learn how RankBeacon processes limited technical information, protects tool inputs, and avoids advertising or marketing use.',
        );
        expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
        expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'http://localhost:8000/privacy',
        );
    });

    it('contains no legal-review or draft disclaimers', () => {
        render(<Privacy />);

        expect(screen.queryByText(/legal review/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/draft/i)).not.toBeInTheDocument();
    });
});
