import Board from "@/models/Board.js";
import Game from "@/models/Game.js";
import Piece from "@/models/Piece.js";
import { convertPositionToCoordinates } from "../utils/helpers.js";
import * as readline from 'readline';
import { InvalidMoveError } from '../errors/GameErrors.js';

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

    startGame(): void {
        this.game.displayBoard();
        this.promptMove();
    }

    private validateMove(piece: Piece | null, fromX: number, fromY: number, toX: number, toY: number): void {
        if (!piece) {
            throw new InvalidMoveError('No piece at that position');
        }

        if (piece.team !== this.game.currentTeam) {
            throw new InvalidMoveError('That is not your piece');
        }

        if (toX < 0 || toX >= this.game.board.boardXSize || toY < 0 || toY >= this.game.board.boardYSize) {
            throw new InvalidMoveError('Invalid destination position');
        }

        // You can add more validation here (e.g., check if move is legal for that piece type)
    }

    private promptMove(): void {
        console.log(`\n${this.game.currentTeam}'s turn`);

        this.rl.question('Enter piece position (e.g., "d2" for x=3, y=2): ', (fromPos) => {
            try {
                const { x: fromX, y: fromY } = convertPositionToCoordinates(fromPos);
                const piece = this.game.board.getPiece(fromX, fromY);

                this.rl.question('Enter destination position (e.g., "d4" for x=3, y=2): ', (toPos) => {
                    try {
                        const { x: toX, y: toY } = convertPositionToCoordinates(toPos);
                        
                        // Validate the move
                        this.validateMove(piece, fromX, fromY, toX, toY);

                        // Move the piece
                        const currentPiece = this.game.board.getPiece(fromX, fromY);
                        if (currentPiece) {
                            this.game.board.removePiece(currentPiece)
                            currentPiece.setPosition(toX, toY);
                            this.game.board.setPiece(currentPiece, toX, toY);

                            // Switch turns
                            this.game.currentTeam = this.game.currentTeam === 'white' ? 'black' : 'white';

                            // Display updated board
                            this.game.displayBoard();
                        }
                    } catch (error) {
                        if (error instanceof InvalidMoveError) {
                            console.log(error.message + '. Try again.');
                        } else {
                            console.log('An unexpected error occurred. Try again.');
                        }
                    } finally {
                        // Continue game regardless of error
                        this.promptMove();
                    }
                });
            } catch (error) {
                if (error instanceof InvalidMoveError) {
                    console.log(error.message + '. Try again.');
                } else {
                    console.log('An unexpected error occurred. Try again.');
                }
                this.promptMove();
            }
        });
    }
}

export default GameStateManager;