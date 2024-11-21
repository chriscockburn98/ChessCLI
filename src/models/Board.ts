import Piece from "./Piece.js";

interface Board {
    board: Array<Array<Piece | null>>;
    addPiece(piece: Piece): void;
}

class Board implements Board {
    board: Array<Array<Piece | null>>;

    constructor() {
        this.board = new Array(8).fill(null).map(() => new Array(8).fill(null));
    }

    addPiece(piece: Piece): void {
        this.board[piece.x][piece.y] = piece;
    }

    getPiece(x: number, y: number): Piece | null {
        return this.board[x][y];
    }

    setPiece(piece: Piece | null, x: number, y: number): void {
        this.board[x][y] = piece;
    }
}

export default Board;