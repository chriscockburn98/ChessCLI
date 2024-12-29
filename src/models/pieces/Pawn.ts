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

    canPromote(): boolean {
        const promotionRank = this.team === 'white' ? 7 : 0;
        return this.y === promotionRank;
    }

    generatePossibleMoves(board: Board): Set<{ x: number, y: number }> {
        const direction = this.team === 'white' ? 1 : -1;
        const startingRank = this.team === 'white' ? 1 : 6;
        const moveSet = new Set<{ x: number, y: number }>();

        // Forward one square
        const oneForward = { x: this.x, y: this.y + direction };
        if (board.isValidPositionBoolean(oneForward.x, oneForward.y) &&
            !board.getPiece(oneForward.x, oneForward.y)) {
            moveSet.add(oneForward);

            // Initial two square move - only if one forward is empty
            if (this.y === startingRank) {
                const twoForward = { x: this.x, y: this.y + (2 * direction) };
                if (board.isValidPositionBoolean(twoForward.x, twoForward.y) &&
                    !board.getPiece(twoForward.x, twoForward.y)) {
                    moveSet.add(twoForward);
                }
            }
        }

        // Diagonal captures - only add if there's an enemy piece
        const leftCapture = { x: this.x - 1, y: this.y + direction };
        const rightCapture = { x: this.x + 1, y: this.y + direction };

        if (board.isValidPositionBoolean(leftCapture.x, leftCapture.y)) {
            const leftPiece = board.getPiece(leftCapture.x, leftCapture.y);
            if (leftPiece && leftPiece.team !== this.team) {
                moveSet.add(leftCapture);
            }
        }
        if (board.isValidPositionBoolean(rightCapture.x, rightCapture.y)) {
            const rightPiece = board.getPiece(rightCapture.x, rightCapture.y);
            if (rightPiece && rightPiece.team !== this.team) {
                moveSet.add(rightCapture);
            }
        }

        return moveSet;
    }
}

export default Pawn;