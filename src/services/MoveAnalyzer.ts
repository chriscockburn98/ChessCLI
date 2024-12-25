import Board from "@/models/Board";
import Piece from "@/models/Piece";
import { InvalidMoveError } from '../errors/GameErrors.js';

class MoveAnalyzer {
    constructor(private board: Board) { }

    isMoveLegal(piece: Piece, toX: number, toY: number): void {
        // Basic validation
        if (!this.board.isValidPositionBoolean(toX, toY)) {
            throw new InvalidMoveError(`Position (${toX}, ${toY}) is outside the board`);
        }

        // Check for friendly piece at destination
        const targetPiece = this.board.getPiece(toX, toY);
        if (targetPiece && targetPiece.team === piece.team) {
            throw new InvalidMoveError('Cannot capture your own piece');
        }

        // Check piece-specific rules
        if (!piece.isValidMove(this.board, toX, toY)) {
            throw new InvalidMoveError(`Invalid move for ${piece.type}`);
        }

        // Check path (except for knights)
        if (piece.requiresPathCheck && !this.board.isPathClear(piece.x, piece.y, toX, toY)) {
            throw new InvalidMoveError('Path is blocked by other pieces');
        }

        // Check if move would put/leave king in check
        const tempBoard = this.board.copyBoard();
        const tempPiece = tempBoard.getPiece(piece.x, piece.y)!;
        tempBoard.removePiece(tempPiece);
        tempBoard.setPiece(tempPiece, toX, toY);

        const king = tempBoard.getPieceByType(piece.team, 'king');
        if (king && tempBoard.isKingInCheck(king)) {
            throw new InvalidMoveError('Move would leave king in check');
        }
    }

    getLegalMoves(piece: Piece): Array<{ x: number, y: number }> {
        const possibleMoves = piece.getPossibleMoves(this.board);
        return Array.from(possibleMoves).filter(move => {
            try {
                this.isMoveLegal(piece, move.x, move.y);
                return true;
            } catch {
                return false;
            }
        });
    }
}

export default MoveAnalyzer;