import Board from "./Board";

abstract class Piece {
    x: number;
    y: number;
    team: string;
    hasMoved: boolean;
    type: string;

    constructor(team: string, type: string) {
        this.x = -1;
        this.y = -1;
        this.team = team;
        this.hasMoved = false;
        this.type = type;
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    abstract isValidMove(board: Board, toX: number, toY: number): boolean;
    abstract allValidMoves(board: Board): { x: number, y: number }[];
}

export default Piece;