import Game from '../models/Game';
import King from '../models/pieces/King';
import Queen from '../models/pieces/Queen';
import Rook from '../models/pieces/Rook';
import Pawn from '../models/pieces/Pawn';
import Bishop from '../models/pieces/Bishop';
import Knight from '../models/pieces/Knight';

describe('Chess Game End-to-End Tests', () => {
    let currentTest: Game;

    beforeEach(() => {
        currentTest = new Game(8, 8);
    });

    afterEach(() => {
        // @ts-ignore - accessing private property for testing
        const testState = expect.getState();
        if (!testState.currentTestName) return;

        const currentExpectationFailed = testState.assertionCalls !== testState.numPassingAsserts;
        console.log(`\nTest ${currentExpectationFailed ? 'failed' : 'passed'}. Current board state: ${testState.currentTestName}`);
        currentTest.displayBoard();
    });

    describe('Checkmate Scenarios', () => {
        test('Fool\'s Mate - Complete board setup', () => {
            // Setup white pieces
            currentTest.board.initialisePiece(new King('white'), 4, 0);
            currentTest.board.initialisePiece(new Queen('white'), 3, 0);
            currentTest.board.initialisePiece(new Rook('white'), 0, 0);
            currentTest.board.initialisePiece(new Rook('white'), 7, 0);
            currentTest.board.initialisePiece(new Knight('white'), 1, 0);
            currentTest.board.initialisePiece(new Knight('white'), 6, 0);
            currentTest.board.initialisePiece(new Bishop('white'), 2, 0);
            currentTest.board.initialisePiece(new Bishop('white'), 5, 0);

            // Setup white pawns
            for (let i = 0; i < 8; i++) {
                if (i !== 5 && i !== 6) { // Skip moved pawns
                    currentTest.board.initialisePiece(new Pawn('white'), i, 1);
                }
            }
            currentTest.board.initialisePiece(new Pawn('white'), 5, 2); // f2-f3
            currentTest.board.initialisePiece(new Pawn('white'), 6, 3); // g2-g4

            // Setup black pieces
            currentTest.board.initialisePiece(new King('black'), 4, 7);
            currentTest.board.initialisePiece(new Queen('black'), 7, 3); // Queen to h4 for checkmate
            currentTest.board.initialisePiece(new Rook('black'), 0, 7);
            currentTest.board.initialisePiece(new Rook('black'), 7, 7);
            currentTest.board.initialisePiece(new Knight('black'), 1, 7);
            currentTest.board.initialisePiece(new Knight('black'), 6, 7);
            currentTest.board.initialisePiece(new Bishop('black'), 2, 7);
            currentTest.board.initialisePiece(new Bishop('black'), 5, 7);

            // Setup black pawns
            for (let i = 0; i < 8; i++) {
                if (i !== 4) { // Skip moved pawn
                    currentTest.board.initialisePiece(new Pawn('black'), i, 6);
                }
            }
            currentTest.board.initialisePiece(new Pawn('black'), 4, 4); // e7-e5

            // Verify checkmate
            expect(currentTest.board.isKingInCheckmate('white')).toBe(true);
            expect(currentTest.board.isKingInCheckmate('black')).toBe(false);
        });

        test('Scholar\'s Mate - Complete board setup', () => {
            // Setup white pieces
            currentTest.board.initialisePiece(new King('white'), 4, 0);
            currentTest.board.initialisePiece(new Queen('white'), 5, 6); // Queen moved for Scholar's mate
            currentTest.board.initialisePiece(new Rook('white'), 0, 0);
            currentTest.board.initialisePiece(new Rook('white'), 7, 0);
            currentTest.board.initialisePiece(new Knight('white'), 1, 0);
            currentTest.board.initialisePiece(new Knight('white'), 6, 0);
            currentTest.board.initialisePiece(new Bishop('white'), 2, 0);
            currentTest.board.initialisePiece(new Bishop('white'), 2, 3); // Bishop moved for Scholar's mate

            // Add white pawns
            for (let i = 0; i < 8; i++) {
                if (i !== 4) { // Skip moved pawn
                    currentTest.board.initialisePiece(new Pawn('white'), i, 1);
                }
            }
            currentTest.board.initialisePiece(new Pawn('white'), 4, 3); // Moved pawn

            // Setup black pieces
            currentTest.board.initialisePiece(new King('black'), 4, 7);
            currentTest.board.initialisePiece(new Queen('black'), 3, 7);
            currentTest.board.initialisePiece(new Rook('black'), 0, 7);
            currentTest.board.initialisePiece(new Rook('black'), 7, 7);
            currentTest.board.initialisePiece(new Knight('black'), 1, 7);
            currentTest.board.initialisePiece(new Knight('black'), 6, 7);
            currentTest.board.initialisePiece(new Bishop('black'), 2, 7);
            currentTest.board.initialisePiece(new Bishop('black'), 5, 7);

            // Setup black pawns
            for (let i = 0; i < 8; i++) {
                if (i !== 4 && i !== 5) { // Skip captured pawn
                    currentTest.board.initialisePiece(new Pawn('black'), i, 6);
                }
            }
            currentTest.board.initialisePiece(new Pawn('black'), 4, 4); // e7-e5

            // Verify checkmate
            expect(currentTest.board.isKingInCheckmate('black')).toBe(true);
            expect(currentTest.board.isKingInCheckmate('white')).toBe(false);
        });
    });

    describe('Non-Checkmate Scenarios', () => {
        test('Opening position - no checkmate', () => {
            // Setup complete initial board position
            setupInitialBoard(currentTest);

            expect(currentTest.board.isKingInCheckmate('white')).toBe(false);
            expect(currentTest.board.isKingInCheckmate('black')).toBe(false);
        });

        test('King in check with escape route', () => {
            // Setup a realistic position where king is in check but can escape
            currentTest.board.initialisePiece(new King('white'), 4, 0);
            currentTest.board.initialisePiece(new Pawn('white'), 3, 1);
            currentTest.board.initialisePiece(new Pawn('white'), 4, 1);
            currentTest.board.initialisePiece(new Pawn('white'), 5, 1);

            currentTest.board.initialisePiece(new King('black'), 4, 7);
            currentTest.board.initialisePiece(new Queen('black'), 4, 2);

            expect(currentTest.board.isKingInCheckmate('white')).toBe(false);
        });
    });
});

function setupInitialBoard(game: Game) {
    // White pieces
    game.board.initialisePiece(new Rook('white'), 0, 0);
    game.board.initialisePiece(new King('white'), 4, 0);
    game.board.initialisePiece(new Queen('white'), 3, 0);
    game.board.initialisePiece(new Rook('white'), 7, 0);

    // White pawns
    for (let i = 0; i < 8; i++) {
        game.board.initialisePiece(new Pawn('white'), i, 1);
    }

    // Black pieces
    game.board.initialisePiece(new Rook('black'), 0, 7);
    game.board.initialisePiece(new King('black'), 4, 7);
    game.board.initialisePiece(new Queen('black'), 3, 7);
    game.board.initialisePiece(new Rook('black'), 7, 7);

    // Black pawns
    for (let i = 0; i < 8; i++) {
        game.board.initialisePiece(new Pawn('black'), i, 6);
    }
} 