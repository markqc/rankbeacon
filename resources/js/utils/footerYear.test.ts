import { describe, expect, it } from 'vitest';
import { currentYear } from './footerYear';

describe('currentYear', () => {
    it('returns the current calendar year', () => {
        expect(currentYear()).toBe(new Date().getFullYear());
    });
});
