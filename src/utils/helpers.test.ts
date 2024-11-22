import { convertPositionToCoordinates } from './helpers';

describe('convertPositionToCoordinates', () => {
    test('converts single letter positions correctly', () => {
        expect(convertPositionToCoordinates('a1')).toEqual({ x: 0, y: 0 });
        expect(convertPositionToCoordinates('b2')).toEqual({ x: 1, y: 1 });
        expect(convertPositionToCoordinates('z18')).toEqual({ x: 25, y: 17 });
    });

    test('converts double letter positions correctly', () => {
        expect(convertPositionToCoordinates('aa1')).toEqual({ x: 26, y: 0 });
        expect(convertPositionToCoordinates('zz99')).toEqual({ x: 51, y: 98 });
    });

    test('handles uppercase letters', () => {
        expect(convertPositionToCoordinates('A1')).toEqual({ x: 0, y: 0 });
        expect(convertPositionToCoordinates('AA5')).toEqual({ x: 26, y: 4 });
    });

    test('handles invalid inputs gracefully', () => {
        // Missing number
        expect(() => convertPositionToCoordinates('a')).toThrow('Invalid position: No number found');
        // Missing letter
        expect(() => convertPositionToCoordinates('1')).toThrow('Invalid position: No letters found');
        // Empty string
        expect(() => convertPositionToCoordinates('')).toThrow('Invalid position: No letters found');
    });

    test('handles multi-letter positions correctly', () => {
        expect(convertPositionToCoordinates('aa1')).toEqual({ x: 26, y: 0 });
        expect(convertPositionToCoordinates('aaa1')).toEqual({ x: 52, y: 0 });
    });

    test('throws an error for invalid multi-letter positions', () => {
        expect(() => convertPositionToCoordinates('ab5')).toThrow('Invalid position: Multi-letter positions must be repeats (e.g., "a1", "aa1", "aaa1")');
        expect(() => convertPositionToCoordinates('a1b')).toThrow('Invalid position: Anything after the number is not allowed');
    });
});
