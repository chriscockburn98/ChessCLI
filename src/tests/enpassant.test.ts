import Game from '@/models/Game';
import Pawn from '../models/pieces/Pawn';
import MoveAnalyzer from '@/services/MoveAnalyzer';


describe('En Passant Tests', () => {
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


    test('white pawn can capture black pawn en passant', () => {
        const whitePawn = new Pawn('white');
        const blackPawn = new Pawn('black');

        // Set up the position
        currentTest.board.initialisePiece(whitePawn, 4, 4); // White pawn on e5
        currentTest.board.initialisePiece(blackPawn, 3, 6); // Black pawn on d7

        // Move black pawn two squares
        currentTest.board.movePiece(3, 6, 3, 4); // d7 to d5

        // Verify en passant is possible
        expect(whitePawn.isValidMove(currentTest.board, 3, 5)).toBe(true);

        // Execute en passant capture through game mechanics
        currentTest.board.movePiece(4, 4, 3, 5);

        // Verify capture was successful
        expect(currentTest.board.getPiece(3, 4)).toBeNull(); // Captured pawn should be removed
        expect(currentTest.board.getPiece(3, 5)).toBe(whitePawn);
    });

    test('en passant is only possible immediately after two-square pawn advance', () => {
        const whitePawn = new Pawn('white');
        const blackPawn = new Pawn('black');

        currentTest.board.initialisePiece(whitePawn, 4, 4);
        currentTest.board.initialisePiece(blackPawn, 3, 6);

        // Move black pawn two squares
        currentTest.board.movePiece(3, 6, 3, 4);

        // Make another move
        const dummyPawn = new Pawn('white');
        currentTest.board.initialisePiece(dummyPawn, 0, 1);
        currentTest.board.movePiece(0, 1, 0, 2);

        // Verify en passant is no longer possible
        expect(whitePawn.isValidMove(currentTest.board, 3, 5)).toBe(false);
    });
});