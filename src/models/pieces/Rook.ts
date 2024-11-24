import Piece from "../Piece.js";
import Board from "../Board.js";

class Rook extends Piece {
    constructor(team: string) {
        super(team);
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
}

export default Rook;