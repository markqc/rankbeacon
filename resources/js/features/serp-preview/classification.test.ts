import { describe, expect, it } from 'vitest';
import { classify, classifyDescriptionFit, statusLabel, statusTone } from './classification';

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

describe('classifyDescriptionFit', () => {
    it('fits all platforms at and below 680px', () => {
        expect(classifyDescriptionFit(500)).toBe('allPlatforms');
        expect(classifyDescriptionFit(680)).toBe('allPlatforms');
    });

    it('fits Google desktop, Bing, and Yahoo above 680px through 920px', () => {
        expect(classifyDescriptionFit(681)).toBe('googleDesktop');
        expect(classifyDescriptionFit(920)).toBe('googleDesktop');
    });

    it('fits Bing and Yahoo only above 920px through 980px', () => {
        expect(classifyDescriptionFit(921)).toBe('bingYahoo');
        expect(classifyDescriptionFit(980)).toBe('bingYahoo');
    });

    it('fits no platform above 980px', () => {
        expect(classifyDescriptionFit(981)).toBe('none');
        expect(classifyDescriptionFit(1500)).toBe('none');
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
