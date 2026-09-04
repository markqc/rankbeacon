import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Home from './Home';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link: (props: any) => {
        const { children, ...rest } = props;
        return <a {...rest}>{children}</a>;
    },
    usePage: () => ({
        url: '/',
        props: {
            app: {
                url: 'http://localhost:8000',
                name: 'RankBeacon',
                env: 'testing',
            },
        },
    }),
}));

describe('Home page', () => {
    it('renders the hero heading and CTAs', () => {
        render(<Home />);

        expect(screen.getByText('See how your pages appear in search.')).toBeInTheDocument();

        const primaryCtAs = screen.getAllByRole('link', { name: 'Open SERP Preview' });
        expect(primaryCtAs.length).toBe(2);
        primaryCtAs.forEach((cta) => {
            expect(cta).toHaveAttribute('href', '/tools/serp-preview');
        });

        const secondaryCtAs = screen.getAllByRole('link', { name: 'Explore All Tools' });
        expect(secondaryCtAs.length).toBe(2);
        secondaryCtAs.forEach((cta) => {
            expect(cta).toHaveAttribute('href', '/tools');
        });
    });

    it('lists available and coming-soon tools', () => {
        render(<Home />);

        expect(screen.getByText('Google SERP Preview')).toBeInTheDocument();
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getAllByText('Coming soon').length).toBe(3);
    });

    it('renders the how-it-works steps', () => {
        render(<Home />);

        expect(screen.getByText('Enter your page URL')).toBeInTheDocument();
        expect(screen.getByText('Edit title and description')).toBeInTheDocument();
        expect(screen.getByText('Compare desktop and mobile')).toBeInTheDocument();
    });
});
