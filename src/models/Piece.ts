import Board from "./Board";

abstract class Piece {
    x: number;
    y: number;
    team: string;
    hasMoved: boolean;
    type: string;
    protected requiresPathCheck: boolean = true;  // Default to true for most pieces

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

    // New abstract method for piece-specific move generation
    protected abstract generatePossibleMoves(board: Board): Set<{ x: number, y: number }>;

    // Move the common filtering logic here
    allValidMoves(board: Board): { x: number, y: number }[] {
        let moves = Array.from(this.generatePossibleMoves(board));

        // Common filtering logic
        moves = moves.filter(move => {
            const piece = board.getPiece(move.x, move.y);
            return (
                (move.x !== this.x || move.y !== this.y) &&
                this.isValidMove(board, move.x, move.y) &&
                (!this.requiresPathCheck || board.isPathClear(this.x, this.y, move.x, move.y)) &&
                (piece === null || piece.team !== this.team)
            );
        });

        return moves;
    }
}

export default Piece;