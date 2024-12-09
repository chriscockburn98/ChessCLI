import Board from "../Board.js";
import Piece from "../Piece.js";

class Bishop extends Piece {
    constructor(team: string) {
        super(team, 'bishop');
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {

        // Bishop moves diagonally
        if (Math.abs(toX - this.x) === Math.abs(toY - this.y)) {
            return true;
        }

        return false;
    }

    protected generatePossibleMoves(board: Board): Set<{ x: number, y: number }> {
        const moveSet = new Set<{ x: number, y: number }>();

        // Check all squares on diagonals
        for (let i = 0; i < 8; i++) {
            if (this.x + i < 8 && this.y + i < 8) moveSet.add({ x: this.x + i, y: this.y + i });
            if (this.x + i < 8 && this.y - i >= 0) moveSet.add({ x: this.x + i, y: this.y - i });
            if (this.x - i >= 0 && this.y + i < 8) moveSet.add({ x: this.x - i, y: this.y + i });
            if (this.x - i >= 0 && this.y - i >= 0) moveSet.add({ x: this.x - i, y: this.y - i });
        }

        return moveSet;
    }
}

export default Bishop;