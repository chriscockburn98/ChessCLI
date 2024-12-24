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

    private copyBoard(): Board {
        const newBoard = new Board(this.boardXSize, this.boardYSize);

        this.board.forEach((row, x) => {
            row.forEach((piece, y) => {
                if (piece) {
                    const newPiece = new (piece.constructor as any)(piece.team);
                    newPiece.setPosition(piece.x, piece.y);
                    newPiece.hasMoved = piece.hasMoved;
                    newBoard.board[x][y] = newPiece;
                }
            });
        });

        return newBoard;
    }

    isValidPositionBoolean(x: number, y: number): boolean {
        try {
            this.isValidPosition(x, y);
            return true;
        } catch (error) {
            return false;
        }
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

    getPieceByType(team: string, type: string): Piece | null {
        return this.board.flat().find(piece => piece?.team === team && piece?.type === type) as Piece | null;
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

    getPiecesByTeam(team: string): Array<Piece> {
        return this.board.flat().filter(piece => piece?.team === team).filter(piece => piece) as Array<Piece>;
    }

    getPiecesByOppositeTeam(team: string): Array<Piece> {
        return this.board.flat().filter(piece => piece?.team !== team).filter(piece => piece) as Array<Piece>;
    }

    // I need to be able to detect when a king is in check, I need to handle the following cases
    //  - Moving a piece whilst the king is currently in check

    // rough way: would be to check all possible moves of the opposite team and detect if the kings coordinates are within.
    // better way: would be to see what oppposite pieces are "in line of sight" of the king.
    isKingInCheck(piece: Piece): boolean {
        const attackingPiecesMoves = this.getOpposingAttackingPiecesMoves(piece);
        const kingsCoordinatesExistInMoves = attackingPiecesMoves.some(move =>
            move.some(move => move.x === piece.x && move.y === piece.y)
        );
        return kingsCoordinatesExistInMoves;
    }

    // Add a new method to check if a move resolves a check situation
    wouldMoveResolveCheck(piece: Piece, toX: number, toY: number): boolean {
        // Create a copy of the board with the proposed move
        const tempBoard = this.copyBoard();
        const tempPiece = tempBoard.getPiece(piece.x, piece.y)!;
        tempBoard.removePiece(tempPiece);
        tempBoard.setPiece(tempPiece, toX, toY);

        // Find the king on the temporary board
        const king = tempBoard.getPieceByType(piece.team, 'king');
        if (!king) return false;

        // Check if the king is still in check after the move
        return !tempBoard.isKingInCheck(king);
    }

    wouldMovePutKingInCheck(piece: Piece, toX: number, toY: number): boolean {
        // Create a copy of the current board state
        const tempBoard = this.copyBoard();

        // Make the move on the temporary board
        const tempPiece = tempBoard.getPiece(piece.x, piece.y)!;
        tempBoard.removePiece(tempPiece);
        tempBoard.setPiece(tempPiece, toX, toY);

        // Find the king of the current team
        const king = tempBoard.getPieceByType(piece.team, 'king');
        if (!king) return false;

        // Check if any opposing piece can attack the king in this position
        return tempBoard.isKingInCheck(king);
    }

    // TODO - finish functionality
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

    getOpposingAttackingPiecesMoves(piece: Piece): Array<{ x: number, y: number }[]> {
        const opposingPieces = this.getPiecesByOppositeTeam(piece.team);
        const opposingPiecesMoves = opposingPieces.map(piece => piece.allValidMoves(this));
        return opposingPiecesMoves;
    }
}

export default Board;