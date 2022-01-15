import { it, expect } from "@jest/globals";
import { format } from '../lib';

describe('format', () => {

    it('handles small numbers', () => {
        expect(format(1)).toBe("   1.000  ");
    });

    it('handles thousands', () => {
        expect(format(1_000)).toBe("   1.000 K");
    });

    it('handles millions', () => {
        expect(format(1_000_000)).toBe("   1.000 M");
    });

    it('handles billions', () => {
        expect(format(1_000_000_000)).toBe("   1.000 B");
    });

    it('handles trillions', () => {
        expect(format(1_000_000_000_000)).toBe("   1.000 T");
    });

    it('handles quad', () => {
        expect(format(1_000_000_000_000_000)).toBe("   1.000 Q");
    });

    it('handles negatives', () => {
        expect(format(-123.456)).toBe("-123.456  ");
    });

    it('has fixed length strings', () => {
        expect(format(-12532463456.2313544).length)
            .toEqual(format(1243).length);
    });

});