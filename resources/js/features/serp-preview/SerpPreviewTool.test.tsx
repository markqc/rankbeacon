import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SerpPreviewTool from './SerpPreviewTool';
import type { ApiData } from './types';

function setCsrfToken(token = 'test-csrf') {
    const existing = document.querySelector('meta[name="csrf-token"]');

    if (existing) {
        existing.setAttribute('content', token);
        return;
    }

    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = token;
    document.head.appendChild(meta);
}

function createApiResponse(data: Partial<ApiData> = {}) {
    const full: ApiData = {
        normalized_url: 'https://example.com/',
        final_url: 'https://example.com/',
        site_name: 'Example',
        title: 'Example Title',
        description: 'Example description.',
        canonical_url: 'https://example.com/',
        favicon_url: 'https://example.com/favicon.ico',
        robots: 'index, follow',
        language: 'en',
        og_title: null,
        og_description: null,
        og_site_name: null,
        breadcrumb_path: null,
        status: 200,
        warnings: [],
        fetched_at: '2026-01-01T00:00:00Z',
        ...data,
    };

    return { data: full, meta: { version: 'v1', fetched_at: full.fetched_at } };
}

describe('SerpPreviewTool', () => {
    beforeEach(() => {
        setCsrfToken();
        globalThis.fetch = vi.fn();
    });

    it('renders all input fields and the reset action', () => {
        render(<SerpPreviewTool />);

        expect(screen.getByLabelText(/Load from URL/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Site name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Breadcrumb \/ path/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Meta description/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reset to sample' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Fetch Page' })).toBeInTheDocument();
    });

    it('updates the title preview as the user types', () => {
        render(<SerpPreviewTool />);
        const titleInput = screen.getByLabelText(/Title/i);

        fireEvent.change(titleInput, { target: { value: 'Custom title text' } });

        expect(screen.getByRole('heading', { name: 'Custom title text' })).toBeInTheDocument();
    });

    it('switches between desktop and mobile previews', () => {
        render(<SerpPreviewTool />);
        const mobileButton = screen.getByRole('button', { name: 'Mobile' });

        fireEvent.click(mobileButton);

        expect(mobileButton).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Desktop' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('resets inputs to the sample values', () => {
        render(<SerpPreviewTool />);
        const titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;

        fireEvent.change(titleInput, { target: { value: 'Changed title' } });
        fireEvent.click(screen.getByRole('button', { name: 'Reset to sample' }));

        expect(titleInput.value).toBe('SERP Preview — RankBeacon');
    });

    it('warns when a title is likely truncated', () => {
        render(<SerpPreviewTool />);
        const titleInput = screen.getByLabelText(/Title/i);

        fireEvent.change(titleInput, { target: { value: 'A'.repeat(300) } });

        expect(screen.getByText('Likely truncated')).toBeInTheDocument();
    });

    it('fetches page metadata and populates the form', async () => {
        const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
        mock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => createApiResponse(),
        });

        render(<SerpPreviewTool />);

        fireEvent.click(screen.getByRole('button', { name: 'Fetch Page' }));

        await waitFor(() => {
            expect(screen.getByText('Fetched metadata successfully.')).toBeInTheDocument();
        });

        expect((screen.getByLabelText(/Site name/i) as HTMLInputElement).value).toBe('Example');
        expect((screen.getByLabelText(/Title/i) as HTMLInputElement).value).toBe('Example Title');
        expect((screen.getByLabelText(/Meta description/i) as HTMLTextAreaElement).value).toBe('Example description.');
    });

    it('shows a partial-success warning for noindex pages', async () => {
        const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
        mock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () =>
                createApiResponse({
                    robots: 'noindex',
                    warnings: ['No meta description found.'],
                }),
        });

        render(<SerpPreviewTool />);

        fireEvent.click(screen.getByRole('button', { name: 'Fetch Page' }));

        await waitFor(() => {
            expect(screen.getByText('Fetched metadata, but some issues were reported.')).toBeInTheDocument();
        });

        expect(screen.getByText(/noindex/i)).toBeInTheDocument();
    });

    it('shows rate-limited state for 429 responses', async () => {
        const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
        mock.mockResolvedValue({
            ok: false,
            status: 429,
            json: async () => ({ message: 'Too Many Requests' }),
        });

        render(<SerpPreviewTool />);

        fireEvent.click(screen.getByRole('button', { name: 'Fetch Page' }));

        await waitFor(() => {
            expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
        });
    });

    it('shows timeout state when the request is aborted', async () => {
        const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
        mock.mockRejectedValue(new DOMException('The request timed out.', 'TimeoutError'));

        render(<SerpPreviewTool />);

        fireEvent.click(screen.getByRole('button', { name: 'Fetch Page' }));

        await waitFor(() => {
            expect(screen.getByText(/timed out/i)).toBeInTheDocument();
        });
    });

    it('shows blocked-url state for unsafe URLs', async () => {
        const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
        mock.mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({
                error: {
                    code: 'PRIVATE_IP',
                    message: 'URL resolves to a private or restricted network.',
                },
            }),
        });

        render(<SerpPreviewTool />);

        fireEvent.click(screen.getByRole('button', { name: 'Fetch Page' }));

        await waitFor(() => {
            expect(screen.getByText(/private or restricted network/i)).toBeInTheDocument();
        });
    });

    it('shows unsupported-content state for non-HTML responses', async () => {
        const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
        mock.mockResolvedValue({
            ok: false,
            status: 502,
            json: async () => ({
                error: {
                    code: 'UNSUPPORTED_CONTENT_TYPE',
                    message: 'Unsupported content type.',
                },
            }),
        });

        render(<SerpPreviewTool />);

        fireEvent.click(screen.getByRole('button', { name: 'Fetch Page' }));

        await waitFor(() => {
            expect(screen.getByText(/unsupported content type/i)).toBeInTheDocument();
        });
    });

    it('prevents double submission while loading', async () => {
        const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
        mock.mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(() => resolve({ ok: true, status: 200, json: async () => createApiResponse() }), 100),
                ),
        );

        render(<SerpPreviewTool />);

        fireEvent.click(screen.getByRole('button', { name: 'Fetch Page' }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Fetching…' })).toBeDisabled();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Fetching…' }));

        expect(mock).toHaveBeenCalledTimes(1);
    });

    it('announces fetch status to screen readers', () => {
        render(<SerpPreviewTool />);

        expect(screen.getByRole('status')).toBeInTheDocument();
    });
});
