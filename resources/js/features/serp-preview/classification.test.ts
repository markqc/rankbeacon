import { describe, expect, it } from 'vitest';
import { classify, statusLabel, statusTone } from './classification';

describe('classify', () => {
    it('returns safe when well under the limit', () => {
        expect(classify(50, 100, 0.8)).toBe('safe');
    });

    it('returns warning when approaching the limit', () => {
        expect(classify(85, 100, 0.8)).toBe('warning');
    });

    it('returns truncated when over the limit', () => {
        expect(classify(110, 100, 0.8)).toBe('truncated');
    });
});

describe('status helpers', () => {
    it('maps safe to a success tone', () => {
        expect(statusTone('safe')).toBe('success');
    });

    it('maps truncated to a danger tone', () => {
        expect(statusTone('truncated')).toBe('danger');
    });

    it('provides a human-readable status label', () => {
        expect(statusLabel('warning')).toBe('Approaching limit');
    });
});
