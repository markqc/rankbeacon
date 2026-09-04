import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Alert from './Alert';

describe('Alert', () => {
    it('renders with a title and content', () => {
        render(<Alert title="Heads up">Body</Alert>);

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Heads up')).toBeInTheDocument();
        expect(screen.getByText('Body')).toBeInTheDocument();
    });
});
