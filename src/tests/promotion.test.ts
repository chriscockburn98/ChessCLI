import Game from '../models/Game';
import Pawn from '../models/pieces/Pawn';
import Queen from '../models/pieces/Queen';
import Board from '../models/Board';
import { InvalidMoveError } from '../errors/GameErrors';

describe('Pawn Promotion Tests', () => {
    let board: Board;

    beforeEach(() => {
        board = new Board(8, 8);
    });

    test('white pawn can detect promotion square', () => {
        const pawn = new Pawn('white');
        board.initialisePiece(pawn, 4, 6); // One move away from promotion
        expect(pawn.canPromote()).toBe(false);

        board.movePiece(4, 6, 4, 7);
        expect(pawn.canPromote()).toBe(true);
    });

    test('black pawn can detect promotion square', () => {
        const pawn = new Pawn('black');
        board.initialisePiece(pawn, 4, 1); // One move away from promotion
        expect(pawn.canPromote()).toBe(false);

        board.movePiece(4, 1, 4, 0);
        expect(pawn.canPromote()).toBe(true);
    });

    test('pawn can be promoted to queen', () => {
        const pawn = new Pawn('white');
        board.initialisePiece(pawn, 4, 7); // Promotion square
        board.promotePawn(pawn, 'queen');

        const promotedPiece = board.getPiece(4, 7);
        expect(promotedPiece).toBeInstanceOf(Queen);
        expect(promotedPiece?.team).toBe('white');
    });

    test('cannot promote non-pawn pieces', () => {
        const queen = new Queen('white');
        board.initialisePiece(queen, 4, 7);

        expect(() => {
            board.promotePawn(queen, 'queen');
        }).toThrow(InvalidMoveError);
    });

    test('cannot promote to invalid piece type', () => {
        const pawn = new Pawn('white');
        board.initialisePiece(pawn, 4, 7);

        expect(() => {
            board.promotePawn(pawn, 'invalid');
        }).toThrow(InvalidMoveError);
    });
});