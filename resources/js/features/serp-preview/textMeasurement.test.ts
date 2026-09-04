import { describe, expect, it } from 'vitest';
import { SERP_FONTS } from './constants';
import { createCanvasMeasurer, fallbackMeasure, measureText, toGraphemes, truncateToWidth } from './textMeasurement';

const font = SERP_FONTS.title;
const fixedMeasure = (text: string) => toGraphemes(text).length * 10;

describe('toGraphemes', () => {
    it('splits ASCII text by grapheme', () => {
        expect(toGraphemes('hello').length).toBe(5);
    });

    it('treats a single emoji as one grapheme', () => {
        expect(toGraphemes('👍').length).toBe(1);
    });

    it('handles an empty string', () => {
        expect(toGraphemes('').length).toBe(0);
    });
});

describe('measureText', () => {
    it('returns zero for empty text', () => {
        expect(measureText('', font, fixedMeasure)).toBe(0);
    });

    it('uses the provided measurer', () => {
        expect(measureText('abc', font, fixedMeasure)).toBe(30);
    });

    it('provides a deterministic fallback measurer outside browsers', () => {
        const width = fallbackMeasure('abc', '16px sans-serif');
        expect(width).toBeGreaterThan(0);
        expect(width).toBe(fallbackMeasure('abc', '16px sans-serif'));
    });

    it('returns a canvas measurer in browser-like environments', () => {
        const measurer = createCanvasMeasurer();
        expect(typeof measurer).toBe('function');
    });
});

describe('truncateToWidth', () => {
    it('returns the original text when it fits', () => {
        expect(truncateToWidth('hello', 100, font, fixedMeasure)).toBe('hello');
    });

    it('appends an ellipsis when the text is too long', () => {
        expect(truncateToWidth('hello world', 100, font, fixedMeasure)).toBe('hello wor…');
    });

    it('handles empty strings', () => {
        expect(truncateToWidth('', 100, font, fixedMeasure)).toBe('');
    });

    it('handles very long unbroken strings', () => {
        const text = 'a'.repeat(300);
        const result = truncateToWidth(text, 100, font, fixedMeasure);

        expect(result.endsWith('…')).toBe(true);
        expect(result.length).toBeLessThan(text.length);
    });

    it('handles Unicode and emoji safely', () => {
        const text = '👍 Hello world';
        const result = truncateToWidth(text, 80, font, fixedMeasure);

        expect(typeof result).toBe('string');
        expect(result.endsWith('…')).toBe(true);
        expect(result.includes('👍')).toBe(true);
    });

    it('handles right-to-left text without reordering', () => {
        const text = 'مرحبا بالعالم';
        const result = truncateToWidth(text, 80, font, fixedMeasure);

        expect(typeof result).toBe('string');
        expect(result.endsWith('…')).toBe(true);
    });
});
