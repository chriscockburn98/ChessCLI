import Board from "./Board.js";
import Piece from "./Piece.js";

interface Game {
    board: Board;
    currentTeam: string;
}

class Game implements Game {
    board: Board;
    currentTeam: string;

    constructor() {
        this.board = new Board();
        this.currentTeam = 'white';
    }

    addPiece(piece: Piece) {
        this.board.addPiece(piece);
    }

    getBoard(): Board {
        return this.board;
    }

    getPiece(x: number, y: number): Piece | null {
        return this.board.getPiece(x, y);
    }

    displayBoard(): void {
        console.log('\n   a b c d e f g h');
        console.log('  ─────────────────');

        for (let y = 7; y >= 0; y--) {
            process.stdout.write(`${y + 1} │`);

            for (let x = 0; x < 8; x++) {
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

        console.log('  ─────────────────');
        console.log('   a b c d e f g h\n');
    }
}

export default Game;