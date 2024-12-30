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

        // Regular diagonal capture
        if (Math.abs(toX - this.x) === 1 && toY === this.y + direction) {
            // Check for normal capture
            if (targetPiece !== null && targetPiece.team !== this.team) {
                return true;
            }

            // Check for en passant
            const adjacentPiece = board.getPiece(toX, this.y);
            if (adjacentPiece && 
                adjacentPiece.type === 'pawn' && 
                adjacentPiece.team !== this.team && 
                adjacentPiece === board.lastMovedPiece && 
                board.lastMoveFromY !== null &&
                Math.abs(board.lastMoveFromY - this.y) === 2) {
                return true;
            }
        }

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

        // Add en passant moves
        if (board.isValidPositionBoolean(this.x - 1, this.y)) {
            const leftPiece = board.getPiece(this.x - 1, this.y);
            if (board.lastMovedPiece && board.lastMoveFromY !== null) {
                if (leftPiece === board.lastMovedPiece && 
                    leftPiece?.type === 'pawn' && 
                    leftPiece.team !== this.team && 
                    Math.abs(board.lastMoveFromY - this.y) === 2) {
                    moveSet.add({ x: this.x - 1, y: this.y + direction });
                }
            }
        }

        if (board.isValidPositionBoolean(this.x + 1, this.y)) {
            const rightPiece = board.getPiece(this.x + 1, this.y);
            if (board.lastMovedPiece && board.lastMoveFromY !== null) {
                if (rightPiece === board.lastMovedPiece && 
                    rightPiece?.type === 'pawn' && 
                    rightPiece.team !== this.team && 
                    Math.abs(board.lastMoveFromY - this.y) === 2) {
                    moveSet.add({ x: this.x + 1, y: this.y + direction });
                }
            }
        }

        return moveSet;
    }
}

export default Pawn;