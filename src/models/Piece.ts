interface Piece {
    x: number;
    y: number;
    team: string;
}

class Piece implements Piece {
    constructor(x: number, y: number, team: string) {
        this.x = x;
        this.y = y;
        this.team = team;
    }

    getPostion() {
        return { x: this.x, y: this.y };
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}


export default Piece;