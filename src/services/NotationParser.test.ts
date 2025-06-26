import NotationParser from './NotationParser.js';
import Board from '../models/Board.js';
import { InvalidMoveError } from '../errors/GameErrors.js';
import Knight from '../models/pieces/Knight.js';
import Pawn from '../models/pieces/Pawn.js';

describe('NotationParser', () => {
    let board: Board;

    beforeEach(() => {
        board = new Board(8, 8);
    });

    describe('parseAlgebraicNotation', () => {
        test('should parse simple pawn move', () => {
            const result = NotationParser.parseAlgebraicNotation('e4');
            expect(result).toEqual({
                piece: 'P',
                toFile: 'e',
                toRank: '4',
                isCapture: false,
                isCheck: false,
                isCheckmate: false,
                isCastling: false,
                fromFile: undefined,
                fromRank: undefined,
                promotion: undefined
            });
        });

        test('should parse piece move', () => {
            const result = NotationParser.parseAlgebraicNotation('Nf3');
            expect(result).toEqual({
                piece: 'N',
                toFile: 'f',
                toRank: '3',
                isCapture: false,
                isCheck: false,
                isCheckmate: false,
                isCastling: false,
                fromFile: undefined,
                fromRank: undefined,
                promotion: undefined
            });
        });

        test('should parse capture', () => {
            const result = NotationParser.parseAlgebraicNotation('exd5');
            expect(result).toEqual({
                piece: 'P',
                toFile: 'd',
                toRank: '5',
                isCapture: true,
                isCheck: false,
                isCheckmate: false,
                isCastling: false,
                fromFile: 'e',
                fromRank: undefined,
                promotion: undefined
            });
        });

        test('should parse check', () => {
            const result = NotationParser.parseAlgebraicNotation('Qh5+');
            expect(result).toEqual({
                piece: 'Q',
                toFile: 'h',
                toRank: '5',
                isCapture: false,
                isCheck: true,
                isCheckmate: false,
                isCastling: false,
                fromFile: undefined,
                fromRank: undefined,
                promotion: undefined
            });
        });

        test('should parse checkmate', () => {
            const result = NotationParser.parseAlgebraicNotation('Qf7#');
            expect(result).toEqual({
                piece: 'Q',
                toFile: 'f',
                toRank: '7',
                isCapture: false,
                isCheck: false,
                isCheckmate: true,
                isCastling: false,
                fromFile: undefined,
                fromRank: undefined,
                promotion: undefined
            });
        });

        test('should parse pawn promotion', () => {
            const result = NotationParser.parseAlgebraicNotation('e8=Q');
            expect(result).toEqual({
                piece: 'P',
                toFile: 'e',
                toRank: '8',
                isCapture: false,
                isCheck: false,
                isCheckmate: false,
                isCastling: false,
                fromFile: undefined,
                fromRank: undefined,
                promotion: 'Q'
            });
        });

        test('should parse kingside castling', () => {
            const result = NotationParser.parseAlgebraicNotation('O-O');
            expect(result).toEqual({
                piece: 'K',
                toFile: 'g',
                toRank: '1',
                isCapture: false,
                isCheck: false,
                isCheckmate: false,
                isCastling: true,
                castlingSide: 'kingside',
                fromFile: undefined,
                fromRank: undefined,
                promotion: undefined
            });
        });

        test('should parse queenside castling', () => {
            const result = NotationParser.parseAlgebraicNotation('O-O-O');
            expect(result).toEqual({
                piece: 'K',
                toFile: 'c',
                toRank: '1',
                isCapture: false,
                isCheck: false,
                isCheckmate: false,
                isCastling: true,
                castlingSide: 'queenside',
                fromFile: undefined,
                fromRank: undefined,
                promotion: undefined
            });
        });

        test('should parse disambiguation by file', () => {
            const result = NotationParser.parseAlgebraicNotation('Nbd7');
            expect(result).toEqual({
                piece: 'N',
                toFile: 'd',
                toRank: '7',
                isCapture: false,
                isCheck: false,
                isCheckmate: false,
                isCastling: false,
                fromFile: 'b',
                fromRank: undefined,
                promotion: undefined
            });
        });

        test('should parse disambiguation by rank', () => {
            const result = NotationParser.parseAlgebraicNotation('R1a3');
            expect(result).toEqual({
                piece: 'R',
                toFile: 'a',
                toRank: '3',
                isCapture: false,
                isCheck: false,
                isCheckmate: false,
                isCastling: false,
                fromFile: undefined,
                fromRank: '1',
                promotion: undefined
            });
        });

        test('should throw error for invalid notation', () => {
            expect(() => NotationParser.parseAlgebraicNotation('x9')).toThrow(InvalidMoveError);
            expect(() => NotationParser.parseAlgebraicNotation('Zd4')).toThrow(InvalidMoveError);
        });
    });

    describe('coordinatesToAlgebraic', () => {
        test('should convert coordinates to algebraic notation', () => {
            expect(NotationParser.coordinatesToAlgebraic(0, 0)).toBe('a1');
            expect(NotationParser.coordinatesToAlgebraic(4, 3)).toBe('e4');
            expect(NotationParser.coordinatesToAlgebraic(7, 7)).toBe('h8');
        });

        test('should throw error for invalid coordinates', () => {
            expect(() => NotationParser.coordinatesToAlgebraic(-1, 0)).toThrow(InvalidMoveError);
            expect(() => NotationParser.coordinatesToAlgebraic(8, 0)).toThrow(InvalidMoveError);
        });
    });

    describe('algebraicToCoordinates', () => {
        test('should convert algebraic notation to coordinates', () => {
            expect(NotationParser.algebraicToCoordinates('a1')).toEqual({ x: 0, y: 0 });
            expect(NotationParser.algebraicToCoordinates('e4')).toEqual({ x: 4, y: 3 });
            expect(NotationParser.algebraicToCoordinates('h8')).toEqual({ x: 7, y: 7 });
        });

        test('should throw error for invalid squares', () => {
            expect(() => NotationParser.algebraicToCoordinates('z9')).toThrow(InvalidMoveError);
            expect(() => NotationParser.algebraicToCoordinates('a9')).toThrow(InvalidMoveError);
        });
    });

    describe('generateAlgebraicNotation', () => {
        test('should generate notation for simple piece move', () => {
            const knight = new Knight('white');
            board.initialisePiece(knight, 1, 0);
            const notation = NotationParser.generateAlgebraicNotation(
                board, 1, 0, 2, 2, knight, false
            );
            expect(notation).toBe('Nc3');
        });

        test('should generate notation for pawn move', () => {
            const pawn = new Pawn('white');
            board.initialisePiece(pawn, 4, 1);
            const notation = NotationParser.generateAlgebraicNotation(
                board, 4, 1, 4, 3, pawn, false
            );
            expect(notation).toBe('e4');
        });

        test('should generate notation for capture', () => {
            const pawn = new Pawn('white');
            board.initialisePiece(pawn, 4, 1);
            const notation = NotationParser.generateAlgebraicNotation(
                board, 4, 1, 3, 2, pawn, true
            );
            expect(notation).toBe('exd3');
        });

        test('should generate notation for pawn promotion', () => {
            const pawn = new Pawn('white');
            board.initialisePiece(pawn, 4, 6);
            const notation = NotationParser.generateAlgebraicNotation(
                board, 4, 6, 4, 7, pawn, false, 'Q'
            );
            expect(notation).toBe('e8=Q');
        });
    });

    describe('edge cases', () => {
        test('should handle notation with extra whitespace', () => {
            const result = NotationParser.parseAlgebraicNotation('  e4  ');
            expect(result.toFile).toBe('e');
            expect(result.toRank).toBe('4');
        });

        test('should handle alternative castling notation', () => {
            const result1 = NotationParser.parseAlgebraicNotation('0-0');
            const result2 = NotationParser.parseAlgebraicNotation('0-0-0');
            expect(result1.isCastling).toBe(true);
            expect(result1.castlingSide).toBe('kingside');
            expect(result2.isCastling).toBe(true);
            expect(result2.castlingSide).toBe('queenside');
        });

        test('should handle complex notation with multiple modifiers', () => {
            const result = NotationParser.parseAlgebraicNotation('Qd1xd8+');
            expect(result).toEqual({
                piece: 'Q',
                toFile: 'd',
                toRank: '8',
                isCapture: true,
                isCheck: true,
                isCheckmate: false,
                isCastling: false,
                fromFile: 'd',
                fromRank: '1',
                promotion: undefined
            });
        });
    });
});