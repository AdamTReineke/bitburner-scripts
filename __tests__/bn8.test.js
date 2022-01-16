import { it, expect } from "@jest/globals";
import { recent } from '../bn8.js';

describe('recent', () => {
    it('counts all positive', () => {
        expect(recent([1,2,3])).toBe(3);
    });

    it('counts all negative', () => {
        expect(recent([-1,-2,-3])).toBe(-3);
    });

    it('counts mixed', () => {
        expect(recent([-1,2,3])).toBe(1);
    });

});