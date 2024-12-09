import Board from "../Board.js";
import Piece from "../Piece.js";

class Queen extends Piece {
    constructor(team: string) {
        super(team, 'queen');
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {

        // Queen moves horizontally, vertically, or diagonallys
        if (toX === this.x || toY === this.y || Math.abs(toX - this.x) === Math.abs(toY - this.y)) {
            return true;
        }

        return false;
    }

    protected generatePossibleMoves(board: Board): Set<{ x: number, y: number }> {
        const moveSet = new Set<{ x: number, y: number }>();

        // Check all squares on the same row, column, and diagonals
        for (let i = 0; i < 8; i++) {
            // Horizontal moves (same row)
            moveSet.add({ x: i, y: this.y });

            // Vertical moves (same column)
            moveSet.add({ x: this.x, y: i });

            // Diagonal moves
            if (this.x + i < 8 && this.y + i < 8) moveSet.add({ x: this.x + i, y: this.y + i });
            if (this.x + i < 8 && this.y - i >= 0) moveSet.add({ x: this.x + i, y: this.y - i });
            if (this.x - i >= 0 && this.y + i < 8) moveSet.add({ x: this.x - i, y: this.y + i });
            if (this.x - i >= 0 && this.y - i >= 0) moveSet.add({ x: this.x - i, y: this.y - i });
        }

        return moveSet;
    }
}

export default Queen;