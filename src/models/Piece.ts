import Board from "./Board";

abstract class Piece {
    x: number;
    y: number;
    team: string;

    constructor(team: string) {
        this.x = -1;
        this.y = -1;
        this.team = team;
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    abstract isValidMove(board: Board, toX: number, toY: number): boolean;
}

export default Piece;