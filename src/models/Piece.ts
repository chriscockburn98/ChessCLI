// interface IPiece {
//     x: number;
//     y: number;
//     team: string;
// }

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

    getPostion() {
        return { x: this.x, y: this.y };
    }
}

export default Piece;