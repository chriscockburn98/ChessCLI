import Piece from "../Piece.js";
import Board from "../Board.js";

class Rook extends Piece {
    constructor(team: string) {
        super(team, 'rook');
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {
        // Rook can only move horizontally or vertically
        if (toX !== this.x && toY !== this.y) {
            return false;
        }

        // Check path for obstacles
        const xDirection = Math.sign(toX - this.x);
        const yDirection = Math.sign(toY - this.y);

        let currentX = this.x + xDirection;
        let currentY = this.y + yDirection;

        while (currentX !== toX || currentY !== toY) {
            if (board.getPiece(currentX, currentY) !== null) {
                return false;
            }
            currentX += xDirection;
            currentY += yDirection;
        }

        return true;
    }

    protected generatePossibleMoves(board: Board): Set<{ x: number, y: number }> {
        const moveSet = new Set<{ x: number, y: number }>();

        // Check all squares on the same row, column, and diagonals
        for (let i = 0; i < 8; i++) {
            // Horizontal moves (same row)
            moveSet.add({ x: i, y: this.y });

            // Vertical moves (same column)
            moveSet.add({ x: this.x, y: i });
        }

        return moveSet;
    }
}

export default Rook;