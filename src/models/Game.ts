import Board from "./Board.js";
import Piece from "./Piece.js";
import chalk from 'chalk';

type Team = 'white' | 'black';

interface Game {
    board: Board;
    currentTeam: string;
}

// Define Unicode symbols for pieces
const pieceSymbols = {
    white: {
        King: '♔',
        Queen: '♕',
        Rook: '♖',
        Bishop: '♗',
        Knight: '♘',
        Pawn: '♙'
    },
    black: {
        King: '♚',
        Queen: '♛',
        Rook: '♜',
        Bishop: '♝',
        Knight: '♞',
        Pawn: '♟'
    }
};

// Define a type for piece names
type PieceName = 'King' | 'Queen' | 'Rook' | 'Bishop' | 'Knight' | 'Pawn';

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

        // Top border with column labels
        let display = '\n     ' + columns.join('   ') + '\n';
        display += '   ┌' + '───┬'.repeat(boardXSize - 1) + '───┐\n';

        for (let y = boardYSize - 1; y >= 0; y--) {
            // Row number
            display += ` ${y + 1} │`;

            for (let x = 0; x < boardXSize; x++) {
                const piece = this.getPiece(x, y);
                const isHighlighted = possibleMoves.some(move => move.x === x && move.y === y);
                const isDarkSquare = (x + y) % 2 === 0;

                // Background colors
                const bgColor = isDarkSquare
                    ? '#4B6584'   // Darker slate blue for dark squares
                    : '#A1B7D4'; // Slightly darker light squares to contrast with white pieces

                // Highlight colors for possible moves
                const highlightColor = isDarkSquare
                    ? '#26DE81'  // Bright green for dark squares
                    : '#2ECC71'; // Slightly darker green for light squares

                // Piece or empty square
                const bg = isHighlighted ? highlightColor : bgColor;
                let symbol = ' ';
                if (piece) {
                    const pieceType = piece.constructor.name as PieceName;
                    symbol = pieceSymbols[piece.team as 'white' | 'black'][pieceType];
                    const pieceColor = piece.team === 'black'
                        ? chalk.hex('#000000')
                        : chalk.hex('#FFFFFF');
                    display += chalk.bgHex(bg)(pieceColor(` ${symbol} `));
                } else {
                    display += chalk.bgHex(bg)('   ');
                }

                // Vertical border
                if (x < boardXSize - 1) {
                    display += chalk.reset('│');
                }
            }
            display += `│ ${y + 1}\n`;

            // Horizontal borders between rows
            if (y > 0) {
                display += '   ├' + '───┼'.repeat(boardXSize - 1) + '───┤\n';
            }
        }

        // Bottom border with column labels
        display += '   └' + '───┴'.repeat(boardXSize - 1) + '───┘\n';
        display += '     ' + columns.join('   ') + '\n';

        if (possibleMoves.length > 0) {
            display += '\nPossible moves are highlighted in green\n';
        }

        console.log(display);
    }

}

export default Game;