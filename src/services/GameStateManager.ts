import Board from "@/models/Board.js";
import Game from "@/models/Game.js";
import Piece from "@/models/Piece.js";
import * as readline from 'readline';

// enum GameState {
//     PLAYING,
//     CHECK,
//     CHECKMATE,
//     STALEMATE
// }

class GameStateManager {
    private game: Game;
    private rl: readline.Interface;

    constructor(game: Game) {
        this.game = game;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    getGameState(): Game {
        return this.game;
    }

    getBoard(): Board {
        return this.game.board;
    }

    getPiece(x: number, y: number): Piece | null {
        return this.game.board.getPiece(x, y);
    }

    startGame(): void {
        this.game.displayBoard();
        this.promptMove();
    }

    private promptMove(): void {
        console.log(`\n${this.game.currentTeam}'s turn`);

        this.rl.question('Enter piece position (e.g., "d2" for x=3, y=2): ', (fromPos) => {
            const fromX = fromPos.charCodeAt(0) - 'a'.charCodeAt(0);
            const fromY = parseInt(fromPos[1]) - 1;

            const piece = this.getPiece(fromX, fromY);
            if (!piece) {
                console.log('No piece at that position. Try again.');
                this.promptMove();
                return;
            }

            if (piece.team !== this.game.currentTeam) {
                console.log('That is not your piece. Try again.');
                this.promptMove();
                return;
            }

            this.rl.question('Enter destination position (e.g., "d4" for x=3, y=2): ', (toPos) => {
                const toX = toPos.charCodeAt(0) - 'a'.charCodeAt(0);
                const toY = parseInt(toPos[1]) - 1;

                // Basic validation
                if (toX < 0 || toX > 7 || toY < 0 || toY > 7) {
                    console.log('Invalid destination. Try again.');
                    this.promptMove();
                    return;
                }

                // Move the piece
                const currentPiece = this.game.board.getPiece(fromX, fromY);
                if (currentPiece) {
                    this.game.board.setPiece(null, fromX, fromY);
                    currentPiece.setPosition(toX, toY);
                    this.game.board.setPiece(currentPiece, toX, toY);

                    // Switch turns
                    this.game.currentTeam = this.game.currentTeam === 'white' ? 'black' : 'white';

                    // Display updated board
                    this.game.displayBoard();

                    // Continue game
                    this.promptMove();
                }
            });
        });
    }
}

export default GameStateManager;