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

    generatePossibleMoves(board: Board): Set<{ x: number, y: number }> {
        const moveSet = new Set<{ x: number, y: number }>();
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },  // horizontal
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 },  // vertical
            { dx: 1, dy: 1 }, { dx: 1, dy: -1 },  // diagonal
            { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
        ];

        for (const dir of directions) {
            let newX = this.x + dir.dx;
            let newY = this.y + dir.dy;

            while (board.isValidPositionBoolean(newX, newY)) {
                moveSet.add({ x: newX, y: newY });

                // Stop if we hit any piece
                if (board.getPiece(newX, newY) !== null) {
                    break;
                }

                newX += dir.dx;
                newY += dir.dy;
            }
        }

        return moveSet;
    }
}

export default Queen;