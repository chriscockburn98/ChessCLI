import Board from "../Board.js";
import Piece from "../Piece.js";

class Bishop extends Piece {
    constructor(team: string) {
        super(team);
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {

        // Bishop moves diagonally
        if (Math.abs(toX - this.x) === Math.abs(toY - this.y)) {
            return true;
        }

        return false;
    }
}

export default Bishop;