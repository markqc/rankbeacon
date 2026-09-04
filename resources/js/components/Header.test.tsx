import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Header from './Header';

describe('Header', () => {
    it('renders primary navigation and the explore CTA', () => {
        render(<Header currentUrl="/" />);

        expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Explore Tools' })).toBeInTheDocument();
    });

    it('marks the current route with aria-current', () => {
        render(<Header currentUrl="/tools" />);

        expect(screen.getByRole('link', { name: 'Tools' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    });

    it('toggles the mobile menu', () => {
        render(<Header currentUrl="/" />);
        const toggle = screen.getByLabelText('Toggle navigation');

        expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument();

        fireEvent.click(toggle);
        expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeInTheDocument();

        fireEvent.click(toggle);
        expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument();
    });
});
