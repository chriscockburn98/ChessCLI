import Board from "../Board.js";
import Piece from "../Piece.js";

class King extends Piece {
    constructor(team: string) {
        super(team, 'king');
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {
        // King moves one square in any direction
        if (Math.abs(toX - this.x) <= 1 && Math.abs(toY - this.y) <= 1) {
            return true;
        }

        return false;
    }

    protected generatePossibleMoves(board: Board): Set<{ x: number, y: number }> {
        const moveSet = new Set<{ x: number, y: number }>();

        // Check all adjacent squares (8 possible moves)
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                moveSet.add({ x: this.x + dx, y: this.y + dy });
            }
        }

        return moveSet;
    }
}

export default King;