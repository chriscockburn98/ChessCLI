import Piece from "../Piece.js";
import Board from "../Board.js";

class Pawn extends Piece {
    constructor(team: string) {
        super(team, 'pawn');
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {
        const direction = this.team === 'white' ? 1 : -1;
        const startingRank = this.team === 'white' ? 1 : 6;

        const targetPiece = board.getPiece(toX, toY);
        // Regular one square forward move
        if (toX === this.x && toY === this.y + direction) {
            return targetPiece === null;
        }

        // Initial two square move
        if (this.y === startingRank && toX === this.x && toY === this.y + (2 * direction)) {
            return targetPiece === null &&
                board.getPiece(toX, this.y + direction) === null;
        }

        // Diagonal capture
        if (Math.abs(toX - this.x) === 1 && toY === this.y + direction) {
            return targetPiece !== null && targetPiece.team !== this.team;
        }

        // TODO: check for en passant

        return false;
    }

    protected generatePossibleMoves(board: Board): Set<{ x: number, y: number }> {
        const direction = this.team === 'white' ? 1 : -1;
        const moveSet = new Set<{ x: number, y: number }>();

        moveSet.add({ x: this.x, y: this.y + direction });
        moveSet.add({ x: this.x, y: this.y + (2 * direction) });
        moveSet.add({ x: this.x + 1, y: this.y + direction });
        // moveSet.add({ x: this.x - 1, y: this.y + direction });

        return moveSet;
    }
}

export default Pawn;