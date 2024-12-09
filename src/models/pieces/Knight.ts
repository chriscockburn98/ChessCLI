import Board from "../Board.js";
import Piece from "../Piece.js";

class Knight extends Piece {
    constructor(team: string) {
        super(team, 'knight');
        this.requiresPathCheck = false;
    }

    isValidMove(board: Board, toX: number, toY: number): boolean {

        // Knight moves in an L shape: two squares in one direction and then one square perpendicular
        if ((Math.abs(toX - this.x) === 2 && Math.abs(toY - this.y) === 1) ||
            (Math.abs(toX - this.x) === 1 && Math.abs(toY - this.y) === 2)) {
            return true;
        }

        return false;
    }

    protected generatePossibleMoves(board: Board): Set<{ x: number, y: number }> {
        const moveSet = new Set<{ x: number, y: number }>();

        // All possible L-shaped moves
        const knightMoves = [
            { dx: 2, dy: 1 },
            { dx: 2, dy: -1 },
            { dx: -2, dy: 1 },
            { dx: -2, dy: -1 },
            { dx: 1, dy: 2 },
            { dx: 1, dy: -2 },
            { dx: -1, dy: 2 },
            { dx: -1, dy: -2 }
        ];

        for (const move of knightMoves) {
            const newX = this.x + move.dx;
            const newY = this.y + move.dy;
            if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                moveSet.add({ x: newX, y: newY });
            }
        }

        return moveSet;
    }
}

export default Knight;