import Board from "../Board.js";
import Piece from "../Piece.js";

class King extends Piece {
    constructor(team: string) {
        super(team, 'king');
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {

        // King moves one square in any direction
        if (Math.abs(toX - this.x) <= 1 && Math.abs(toY - this.y) <= 1) {
            return true;
        }

        return false;
    }

    allValidMoves(board: Board): { x: number, y: number }[] {
        return [];
    }
}

export default King;