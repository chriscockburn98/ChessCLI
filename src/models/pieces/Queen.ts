import Piece from "../Piece.js";

class Queen extends Piece {
    constructor(x: number, y: number, team: string) {
        super(x, y, team);
    }
}

export default Queen;