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
        const isValid = x >= 0 && x < this.boardXSize && y >= 0 && y < this.boardYSize;
        if (!isValid) throw new InvalidMoveError(`Position (${x}, ${y}) is out of bounds. Board size is ${this.boardXSize}x${this.boardYSize}`);
        return isValid;
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
        this.isValidPosition(x, y);
        return this.board[x][y];
    }

    initialisePiece(piece: Piece, x: number, y: number): void {
        this.isValidPosition(x, y)
        piece.setPosition(x, y);
        this.board[x][y] = piece;
    }

    setPiece(piece: Piece, x: number, y: number): void {
        this.isValidPosition(x, y)
        piece.setPosition(x, y);
        this.board[x][y] = piece;
        piece.hasMoved = true;
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