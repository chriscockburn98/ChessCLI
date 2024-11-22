import Board from "./Board.js";
import Piece from "./Piece.js";

interface Game {
    board: Board;
    currentTeam: string;
}

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

        // I want to make the logging dynamic based on the board size
        // so if we have a 12x8 board, we want to log 12 rows and 8 columns
        const columns = Array.from({ length: boardXSize }, (_, i) => String.fromCharCode(97 + i));

        console.log(`   ${columns.join(' ')}`);
        console.log(`   ${'──'.repeat(boardXSize)}`);

        for (let y = boardYSize - 1; y >= 0; y--) {
            process.stdout.write(`${y + 1} │`);

            for (let x = 0; x < boardXSize; x++) {
                const piece = this.getPiece(x, y);
                let symbol = '·';

                if (piece) {
                    // Get piece symbol based on class name
                    switch (piece.constructor.name) {
                        case 'Pawn': symbol = 'P'; break;
                        case 'Rook': symbol = 'R'; break;
                        case 'Knight': symbol = 'N'; break;
                        case 'Bishop': symbol = 'B'; break;
                        case 'Queen': symbol = 'Q'; break;
                        case 'King': symbol = 'K'; break;
                    }
                }

                process.stdout.write(` ${symbol}`);
            }
            console.log(` │ ${y + 1}`);
        }

        console.log(`   ${'──'.repeat(boardXSize)}`);
        console.log(`   ${columns.join(' ')}`);
    }
}

export default Game;