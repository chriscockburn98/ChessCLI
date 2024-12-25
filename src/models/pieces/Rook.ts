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

    generatePossibleMoves(board: Board): Set<{ x: number, y: number }> {
        const moveSet = new Set<{ x: number, y: number }>();
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];

        for (const dir of directions) {
            let newX = this.x + dir.dx;
            let newY = this.y + dir.dy;

            while (board.isValidPositionBoolean(newX, newY)) {
                moveSet.add({ x: newX, y: newY });
                
                // Stop if we hit any piece
                if (board.getPiece(newX, newY) !== null) {
                    break;
                }

                newX += dir.dx;
                newY += dir.dy;
            }
        }

        return moveSet;
    }
}

export default Rook;