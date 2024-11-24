import Board from "../Board.js";
import Piece from "../Piece.js";

class Knight extends Piece {
    constructor(team: string) {
        super(team);
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {

        // Knight moves in an L shape: two squares in one direction and then one square perpendicular
        if ((Math.abs(toX - this.x) === 2 && Math.abs(toY - this.y) === 1) ||
            (Math.abs(toX - this.x) === 1 && Math.abs(toY - this.y) === 2)) {
            return true;
        }

        return false;
    }
}

export default Knight;