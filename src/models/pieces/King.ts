import Board from "../Board.js";
import Piece from "../Piece.js";

class King extends Piece {
    constructor(team: string) {
        super(team, 'king');
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {
        // Regular king move (one square in any direction)
        if (Math.abs(toX - this.x) <= 1 && Math.abs(toY - this.y) <= 1) {
            return true;
        }

        // Check for castling
        if (this.y === toY && !this.hasMoved) {
            // Kingside castling
            if (toX === this.x + 2) {
                const rook = board.getPiece(7, this.y);
                if (rook?.type === 'rook' && !rook.hasMoved) {
                    return board.isPathClear(this.x, this.y, 7, this.y);
                }
            }
            // Queenside castling
            if (toX === this.x - 2) {
                const rook = board.getPiece(0, this.y);
                if (rook?.type === 'rook' && !rook.hasMoved) {
                    return board.isPathClear(this.x, this.y, 0, this.y);
                }
            }
        }

        return false;
    }

    generatePossibleMoves(board: Board): Set<{ x: number, y: number }> {
        const moveSet = new Set<{ x: number, y: number }>();

        // Regular king moves
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const newX = this.x + dx;
                const newY = this.y + dy;
                if (board.isValidPositionBoolean(newX, newY)) {
                    moveSet.add({ x: newX, y: newY });
                }
            }
        }

        // Add castling moves if conditions are met
        if (!this.hasMoved) {
            // Kingside castling
            const kingsideRook = board.getPiece(7, this.y);
            if (kingsideRook?.type === 'rook' && !kingsideRook.hasMoved) {
                if (board.isPathClear(this.x, this.y, 7, this.y)) {
                    moveSet.add({ x: this.x + 2, y: this.y });
                }
            }

            // Queenside castling
            const queensideRook = board.getPiece(0, this.y);
            if (queensideRook?.type === 'rook' && !queensideRook.hasMoved) {
                if (board.isPathClear(this.x, this.y, 0, this.y)) {
                    moveSet.add({ x: this.x - 2, y: this.y });
                }
            }
        }

        return moveSet;
    }
}

export default King;