import Board from '../models/Board';
import King from '../models/pieces/King';
import Rook from '../models/pieces/Rook';

describe('King Tests', () => {
    let board: Board;

    beforeEach(() => {
        board = new Board(8, 8);
    });

    describe('Castling', () => {
        test('should allow kingside castling when conditions are met', () => {
            const king = new King('white');
            const rook = new Rook('white');
            board.initialisePiece(king, 4, 0);
            board.initialisePiece(rook, 7, 0);

            expect(king.isValidMove(board, 6, 0)).toBe(true);
        });

        test('should not allow kingside castling if king has moved', () => {
            const king = new King('white');
            const rook = new Rook('white');
            board.initialisePiece(king, 4, 0);
            board.initialisePiece(rook, 7, 0);

            king.hasMoved = true;
            expect(king.isValidMove(board, 6, 0)).toBe(false);
        });

        test('should not allow kingside castling if rook has moved', () => {
            const king = new King('white');
            const rook = new Rook('white');
            board.initialisePiece(king, 4, 0);
            board.initialisePiece(rook, 7, 0);

            rook.hasMoved = true;
            expect(king.isValidMove(board, 6, 0)).toBe(false);
        });

        test('should not allow castling if pieces are between king and rook', () => {
            const king = new King('white');
            const rook = new Rook('white');
            const blockingRook = new Rook('white');
            board.initialisePiece(king, 4, 0);
            board.initialisePiece(rook, 7, 0);
            board.initialisePiece(blockingRook, 5, 0);

            expect(king.isValidMove(board, 6, 0)).toBe(false);
        });

        test('should correctly position both king and rook after kingside castling', () => {
            const king = new King('white');
            const rook = new Rook('white');
            board.initialisePiece(king, 4, 0);
            board.initialisePiece(rook, 7, 0);

            // Perform the castling move
            board.movePiece(4, 0, 6, 0);

            // Verify king's new position
            expect(board.getPiece(6, 0)).toBe(king);
            // Verify rook's new position
            expect(board.getPiece(5, 0)).toBe(rook);
            // Verify original positions are empty
            expect(board.getPiece(4, 0)).toBeNull();
            expect(board.getPiece(7, 0)).toBeNull();
        });

        test('should correctly position both king and rook after queenside castling', () => {
            const king = new King('white');
            const rook = new Rook('white');
            board.initialisePiece(king, 4, 0);
            board.initialisePiece(rook, 0, 0);

            // Perform the castling move
            board.movePiece(4, 0, 2, 0);

            // Verify king's new position
            expect(board.getPiece(2, 0)).toBe(king);
            // Verify rook's new position
            expect(board.getPiece(3, 0)).toBe(rook);
            // Verify original positions are empty
            expect(board.getPiece(4, 0)).toBeNull();
            expect(board.getPiece(0, 0)).toBeNull();
        });
    });
});
