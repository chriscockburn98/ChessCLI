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

    displayBoard(): void {
        const boardYSize = this.board.getBoardYSize();
        const boardXSize = this.board.getBoardXSize();
        const columns = Array.from({ length: boardXSize }, (_, i) => String.fromCharCode(97 + i));

        console.log(`    ${columns.join(' ')}`);
        console.log(`   ${'──'.repeat(boardXSize)}`);

        for (let y = boardYSize - 1; y >= 0; y--) {
            process.stdout.write(`${y + 1} │`);

            for (let x = 0; x < boardXSize; x++) {
                const piece = this.getPiece(x, y);
                let symbol = '·';

                if (piece) {
                    const pieceType = piece.constructor.name;
                    symbol = pieces[piece.team as Team][pieceType];
                }

                process.stdout.write(` ${symbol}`);
            }
            console.log(` │ ${y + 1}`);
        }

        console.log(`   ${'──'.repeat(boardXSize)}`);
        console.log(`    ${columns.join(' ')}`);
    }
}

export default Game;