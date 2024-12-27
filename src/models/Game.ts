import Board from "./Board.js";
import Piece from "./Piece.js";

type Team = 'white' | 'black';

interface Game {
    board: Board;
    currentTeam: string;
}

// Unicode chess pieces
const pieces: Record<Team, Record<string, string>> = {
    white: {
        'Pawn': '♟',
        'Rook': '♜',
        'Knight': '♞',
        'Bishop': '♝',
        'Queen': '♛',
        'King': '♚'
    },
    black: {
        'Pawn': '♙',
        'Rook': '♖',
        'Knight': '♘',
        'Bishop': '♗',
        'Queen': '♕',
        'King': '♔'
    }
};

class Game implements Game {
    board: Board;
    currentTeam: string;

    constructor(boardXSize: number, boardYSize: number) {
        this.board = new Board(boardXSize, boardYSize);
        this.currentTeam = 'white';
    }

    getBoard(): Board {
        return this.board;
    }

    getPiece(x: number, y: number): Piece | null {
        return this.board.getPiece(x, y);
    }

    displayBoard(possibleMoves: { x: number, y: number }[] = []): void {
        const boardYSize = this.board.getBoardYSize();
        const boardXSize = this.board.getBoardXSize();
        const columns = Array.from({ length: boardXSize }, (_, i) => String.fromCharCode(97 + i));

        let display = `    ${columns.join(' ')}\n`;
        display += `   ${'──'.repeat(boardXSize)}\n`;

        for (let y = boardYSize - 1; y >= 0; y--) {
            display += `${y + 1} │`;

            for (let x = 0; x < boardXSize; x++) {
                const piece = this.getPiece(x, y);
                let symbol = '·';

                const isHighlighted = possibleMoves.some(move => move.x === x && move.y === y);

                if (piece) {
                    const pieceType = piece.constructor.name;
                    if (isHighlighted) {
                        symbol = '×';
                    } else {
                        symbol = pieces[piece.team as Team][pieceType];
                    }
                } else if (isHighlighted) {
                    symbol = '○';
                }

                display += ` ${symbol}`;
            }
            display += ` │ ${y + 1}\n`;
        }

        display += `   ${'──'.repeat(boardXSize)}\n`;
        display += `    ${columns.join(' ')}`;

        if (possibleMoves.length > 0) {
            display += '\n\nLegend:\n○ - Possible move\n× - Possible capture';
        }

        console.log(display);
    }
}

export default Game;