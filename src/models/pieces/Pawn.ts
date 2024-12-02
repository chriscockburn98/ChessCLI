import Piece from "../Piece.js";
import Board from "../Board.js";

class Pawn extends Piece {
    constructor(team: string) {
        super(team, 'pawn');
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

    allValidMoves(board: Board): { x: number, y: number }[] {
        const direction = this.team === 'white' ? 1 : -1;

        let moves = [];
        const potentialMoves = [
            { x: this.x, y: this.y + direction },
            this.hasMoved ? null : { x: this.x, y: this.y + (2 * direction) },
            { x: this.x + 1, y: this.y + direction },
            { x: this.x - 1, y: this.y + direction }
        ].filter(move => move !== null);

        moves = potentialMoves.filter(move => this.isValidMove(board, move.x, move.y));

        return moves;
    }
}

export default Pawn;