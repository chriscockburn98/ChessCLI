import Board from "../Board.js";
import Piece from "../Piece.js";

class Queen extends Piece {
    constructor(team: string) {
        super(team, 'queen');
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {

        // Queen moves horizontally, vertically, or diagonallys
        if (toX === this.x || toY === this.y || Math.abs(toX - this.x) === Math.abs(toY - this.y)) {
            return true;
        }

        return false;
    }

    allValidMoves(board: Board): { x: number, y: number }[] {
        return [];
    }
}

export default Queen;