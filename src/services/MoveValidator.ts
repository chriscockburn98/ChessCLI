import Game from "@/models/Game.js";
import Piece from "@/models/Piece.js";
import { InvalidMoveError } from '../errors/GameErrors.js';
import MoveAnalyzer from './MoveAnalyzer.js';

class MoveValidator {
    validateMove(game: Game, piece: Piece | null, fromX: number, fromY: number, toX: number, toY: number): void {
        if (!piece) {
            throw new InvalidMoveError('No piece at that position');
        }

        if (piece.team !== game.currentTeam) {
            throw new InvalidMoveError('That is not your piece');
        }

        const analyzer = new MoveAnalyzer(game.board);
        analyzer.isMoveLegal(piece, toX, toY);
    }
}

export default MoveValidator;