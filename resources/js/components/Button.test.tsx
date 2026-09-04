import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Button from './Button';

describe('Button', () => {
    it('renders children and uses the primary variant by default', () => {
        render(<Button>Save</Button>);
        const button = screen.getByRole('button', { name: 'Save' });

        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('bg-teal-500');
    });

    it('is disabled when the disabled prop is set', () => {
        render(<Button disabled>Save</Button>);
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
});
