import Piece from "../Piece.js";
import Board from "../Board.js";

class Pawn extends Piece {
    constructor(team: string) {
        super(team);
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {
        const direction = this.team === 'white' ? 1 : -1;
        const startingRank = this.team === 'white' ? 1 : 6;

        // Regular one square forward move
        if (toX === this.x && toY === this.y + direction) {
            return board.getPiece(toX, toY) === null;
        }

        // Initial two square move
        if (this.y === startingRank && toX === this.x && toY === this.y + (2 * direction)) {
            return board.getPiece(toX, toY) === null &&
                board.getPiece(toX, this.y + direction) === null;
        }

        // Diagonal capture
        if (Math.abs(toX - this.x) === 1 && toY === this.y + direction) {
            const targetPiece = board.getPiece(toX, toY);
            return targetPiece !== null && targetPiece.team !== this.team;
        }

        // TODO: check for en passant

        return false;
    }
}

export default Pawn;