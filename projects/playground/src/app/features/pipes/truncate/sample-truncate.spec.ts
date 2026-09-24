import { truncate } from './sample-truncate';

describe('truncate (sample)', () => {
    it('leaves short text alone', () => {
        expect(truncate('Abbos', 10)).toBe('Abbos');
    });

    it('cuts, trims trailing space and appends the suffix', () => {
        expect(truncate('Calm and configurable', 5)).toBe('Calm…');
    });

    it('supports a custom suffix', () => {
        expect(truncate('Configurable', 6, '...')).toBe('Config...');
    });

    it('treats null and undefined as empty text', () => {
        expect(truncate(null)).toBe('');
        expect(truncate(undefined)).toBe('');
    });

    it('clamps negative and invalid lengths to zero', () => {
        expect(truncate('Abbos', -3)).toBe('…');
        expect(truncate('Abbos', Number.NaN)).toBe('…');
    });
});
