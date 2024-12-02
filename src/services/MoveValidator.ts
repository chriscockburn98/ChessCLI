import Game from "@/models/Game.js";
import Piece from "@/models/Piece.js";
import { InvalidMoveError } from '../errors/GameErrors.js';
import Knight from '../models/pieces/Knight.js';

class MoveValidator {
    validateMove(game: Game, piece: Piece | null, fromX: number, fromY: number, toX: number, toY: number): void {
        // Check if the king is in check
        if (game.board.isKingInCheck(game.currentTeam)) {
            throw new InvalidMoveError('Your king is in check');
        }

        if (!piece) {
            throw new InvalidMoveError('No piece at that position');
        }

        if (piece.team !== game.currentTeam) {
            throw new InvalidMoveError('That is not your piece');
        }

        if (toX < 0 || toX >= game.board.boardXSize || toY < 0 || toY >= game.board.boardYSize) {
            throw new InvalidMoveError('Invalid destination position');
        }

        // Check if the target square has a piece of the same team
        const targetPiece = game.board.getPiece(toX, toY);
        if (targetPiece && targetPiece.team === piece.team) {
            throw new InvalidMoveError('Cannot capture your own piece');
        }

        // Skip path checking for Knights since they can jump over pieces
        if (!(piece instanceof Knight)) {
            // Check if there's a piece in the way
            if (!game.board.isPathClear(fromX, fromY, toX, toY)) {
                throw new InvalidMoveError('There is a piece in the way');
            }
        }

        // Check piece-specific movement rules
        if (!piece.isValidMove(game.board, toX, toY)) {
            throw new InvalidMoveError('Invalid move for this piece type');
        }
    }
}

export default MoveValidator;