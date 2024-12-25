import MoveAnalyzer from "../services/MoveAnalyzer.js";
import Board from "./Board";

abstract class Piece {
    x: number;
    y: number;
    team: string;
    hasMoved: boolean;
    type: string;
    requiresPathCheck: boolean = true;  // Default to true for most pieces

    constructor(team: string, type: string) {
        this.x = -1;
        this.y = -1;
        this.team = team;
        this.hasMoved = false;
        this.type = type;
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    abstract isValidMove(board: Board, toX: number, toY: number): boolean;

    protected filterFriendlyPieces(board: Board, moves: Set<{ x: number, y: number }>): Set<{ x: number, y: number }> {
        const filteredMoves = new Set<{ x: number, y: number }>();

        for (const move of moves) {
            const targetPiece = board.getPiece(move.x, move.y);
            if (!targetPiece || targetPiece.team !== this.team) {
                filteredMoves.add(move);
            }
        }

        return filteredMoves;
    }

    getPossibleMoves(board: Board): Set<{ x: number, y: number }> {
        const moves = this.generatePossibleMoves(board);
        return this.filterFriendlyPieces(board, moves);
    }

    // New abstract method for piece-specific move generation
    abstract generatePossibleMoves(board: Board): Set<{ x: number, y: number }>;

    // Move the common filtering logic here
    allValidMoves(board: Board): { x: number, y: number }[] {
        const analyzer = new MoveAnalyzer(board);
        return analyzer.getLegalMoves(this);
    }
}

export default Piece;