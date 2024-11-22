export function convertPositionToCoordinates(position: string): { x: number, y: number } {
    // Extract the letter part (can be one or two characters)
    const _letters = position.match(/[a-z]+/i)?.[0] || '';
    const letters = _letters.toLowerCase();

    if (!letters) {
        throw new Error('Invalid position: No letters found');
    }

    // Validate that all letters are the same
    if (letters.length > 1 && !letters.split('').every(char => char === letters[0])) {
        throw new Error('Invalid position: Multi-letter positions must be repeats (e.g., "a1", "aa1", "aaa1")');
    }

    // Extract the number part
    const number = parseInt(position.match(/\d+/)?.[0] || '0');

    if (!number) {
        throw new Error('Invalid position: No number found');
    }

    // if theres anything after the number, throw an error
    if (position.slice(letters.length + number.toString().length)) {
        throw new Error('Invalid position: Anything after the number is not allowed');
    }

    // Convert letters to number (a=0, b=1, ..., z=25, aa=26, bb=27, ...)
    let x = 0;
    if (letters.length === 1) {
        x = letters.charCodeAt(0) - 'a'.charCodeAt(0);
    } else {
        x = ((letters.length - 1) * 26) + (letters.charCodeAt(0) - 'a'.charCodeAt(0));
    }

    // y coordinate is just the number minus 1 (since positions start at 1)
    const y = number - 1;

    return { x, y };
};