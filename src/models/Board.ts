import { InvalidMoveError } from "../errors/GameErrors.js";
import Piece from "./Piece.js";

interface Board {
    boardXSize: number;
    boardYSize: number;
    board: Array<Array<Piece | null>>;
}

class Board implements Board {
    boardXSize: number;
    boardYSize: number;
    board: Array<Array<Piece | null>>;

    constructor(boardXSize: number, boardYSize: number) {
        this.boardXSize = boardXSize;
        this.boardYSize = boardYSize;
        this.board = new Array(boardXSize).fill(null).map(() => new Array(boardYSize).fill(null));
    }

    private isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < this.boardXSize && y >= 0 && y < this.boardYSize;
    }

    getBoardXSize(): number {
        return this.boardXSize;
    }

    getBoardYSize(): number {
        return this.boardYSize;
    }

    removePiece(piece: Piece): void {
        this.board[piece.x][piece.y] = null;
    }

    getPiece(x: number, y: number): Piece | null {
        if (!this.isValidPosition(x, y)) {
            throw new InvalidMoveError(`Position (${x}, ${y}) is out of bounds. Board size is ${this.boardXSize}x${this.boardYSize}`);
        }
        return this.board[x][y];
    }

    setPiece(piece: Piece, x: number, y: number): void {
        if (!this.isValidPosition(x, y)) {
            throw new InvalidMoveError(`Position (${x}, ${y}) is out of bounds. Board size is ${this.boardXSize}x${this.boardYSize}`);
        }
        piece.setPosition(x, y);
        this.board[x][y] = piece;
    }

    isKingInCheck(team: string): boolean {
        return false;
    }


    isKingInCheckmate(team: string): boolean {
        return false;
    }

    isPathClear(fromX: number, fromY: number, toX: number, toY: number): boolean {
        // Get the direction of movement
        const xDirection = Math.sign(toX - fromX);
        const yDirection = Math.sign(toY - fromY);

        // Start from the square after the starting position
        let currentX = fromX + xDirection;
        let currentY = fromY + yDirection;

        // Check each square along the path until we reach the destination
        while (currentX !== toX || currentY !== toY) {
            // If we find a piece in the path, return false
            if (this.getPiece(currentX, currentY) !== null) {
                return false;
            }
            currentX += xDirection;
            currentY += yDirection;
        }

        // If we've made it here, the path is clear
        return true;
    }
}

export default Board;