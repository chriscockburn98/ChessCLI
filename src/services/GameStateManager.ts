import Board from "@/models/Board.js";
import Game from "@/models/Game.js";
import Piece from "@/models/Piece.js";
import { convertPositionToCoordinates } from "../utils/helpers.js";
import * as readline from 'readline';
import { InvalidMoveError } from '../errors/GameErrors.js';
import MoveValidator from './MoveValidator.js';

class GameStateManager {
    private game: Game;
    private rl: readline.Interface;
    private moveValidator: MoveValidator;

    constructor(game: Game) {
        this.game = game;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.moveValidator = new MoveValidator();
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
        this.moveValidator.validateMove(this.game, piece, fromX, fromY, toX, toY);
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

                            // Check for checkmate
                            if (this.game.board.isKingInCheckmate(this.game.currentTeam)) {
                                console.log(`Checkmate! ${this.game.currentTeam} loses.`);
                                this.rl.close();
                                return;
                            }

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