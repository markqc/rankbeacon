import { describe, expect, it } from 'vitest';
import { formatUrl, sanitizeInput } from './formatting';

describe('formatUrl', () => {
    it('extracts the domain and path from an https URL', () => {
        const { domain, display } = formatUrl('https://example.com/blog/post', '', '');

        expect(domain).toBe('example.com');
        expect(display).toBe('example.com › blog › post');
    });

    it('removes www from the domain', () => {
        const { display } = formatUrl('https://www.example.com', '', '');

        expect(display).toBe('example.com');
    });

    it('uses the site name when provided', () => {
        const { display } = formatUrl('https://example.com/blog/post', 'My Site', '');

        expect(display).toBe('My Site › blog › post');
    });

    it('prefers the breadcrumb prop over the URL pathname', () => {
        const { display } = formatUrl('https://example.com/a/b', '', 'x/y');

        expect(display).toBe('example.com › x › y');
    });

    it('handles URLs without a scheme', () => {
        const { display } = formatUrl('example.com/about', '', '');

        expect(display).toBe('example.com › about');
    });

    it('falls back gracefully for unparseable input', () => {
        const { display } = formatUrl('not a url', '', '');

        expect(display).toBe('not a url');
    });

    it('strips query strings and hashes', () => {
        const { display } = formatUrl('https://example.com/page?foo=bar#section', '', '');

        expect(display).toBe('example.com › page');
    });
});

describe('sanitizeInput', () => {
    it('removes HTML tags from user input', () => {
        expect(sanitizeInput('<b>test</b>')).toBe('test');
    });

    it('trims whitespace', () => {
        expect(sanitizeInput('  test  ')).toBe('test');
    });
});
