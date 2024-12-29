import Board from "@/models/Board.js";
import Game from "@/models/Game.js";
import Piece from "@/models/Piece.js";
import { convertCoordinatesToPosition, convertCoordinatesToPositionArray, convertPositionToCoordinates } from "../utils/helpers.js";
import * as readline from 'readline';
import { InvalidMoveError } from '../errors/GameErrors.js';
import MoveValidator from './MoveValidator.js';
import inquirer from 'inquirer';

class GameStateManager {
    private game: Game;
    private showPossibleMoves: boolean;
    private rl: readline.Interface;
    private moveValidator: MoveValidator;

    constructor(game: Game, showPossibleMoves: boolean) {
        this.game = game;
        this.showPossibleMoves = showPossibleMoves;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.moveValidator = new MoveValidator();
    }

    private async promptMove(): Promise<void> {
        try {
            console.log(`\n${this.game.currentTeam}'s turn`);

            const fromPos = await new Promise<string>((resolve) => {
                this.rl.question('Enter piece position (e.g., "d2" for x=3, y=2): ', (answer) => {
                    resolve(answer);
                });
            });

            const { x: fromX, y: fromY } = convertPositionToCoordinates(fromPos);
            const piece = this.game.board.getPiece(fromX, fromY);

            if (!piece) {
                throw new InvalidMoveError(`No piece at position (${fromX}, ${fromY})`);
            }

            // Get and display possible moves
            const possibleMoves = piece.allValidMoves(this.game.board);
            this.game.displayBoard(possibleMoves);

            if (this.showPossibleMoves) {
                const positions = convertCoordinatesToPositionArray(possibleMoves);
                console.log(`Possible moves for ${piece.type} at ${fromPos}: ${positions.join(', ')}`);
            }

            // Get move selection using arrow keys
            const selectedMove = await this.promptDestination(piece, possibleMoves);

            // Validate and make the move
            this.validateMove(piece, fromX, fromY, selectedMove.x, selectedMove.y);

            // Move the piece
            const currentPiece = this.game.board.getPiece(fromX, fromY);
            if (currentPiece) {
                this.game.board.movePiece(currentPiece.x, currentPiece.y, selectedMove.x, selectedMove.y);

                // Switch turns
                this.game.currentTeam = this.game.currentTeam === 'white' ? 'black' : 'white';

                // Check for checkmate
                if (this.game.board.isKingInCheckmate(this.game.currentTeam)) {
                    console.log(`Checkmate! ${this.game.currentTeam} loses.`);
                    this.rl.close();
                    return;
                }

                // Display updated board
                this.game.displayBoard();
            }

            // Continue with next move
            await this.promptMove();

        } catch (error) {
            if (error instanceof InvalidMoveError) {
                console.log(error.message + '. Try again.');
            } else {
                console.error('An unexpected error occurred:', error);
                console.log('Try again.');
            }
            await this.promptMove();
        }
    }

    private async promptDestination(piece: Piece, possibleMoves: { x: number, y: number }[]): Promise<{ x: number, y: number }> {
        const positions = possibleMoves.map(move => convertCoordinatesToPosition(move));

        if (positions.length === 0) {
            throw new InvalidMoveError('No valid moves available for this piece');
        }

        // Close readline interface completely
        this.rl.close();

        const { selectedMove } = await inquirer.prompt<{ selectedMove: string }>({
            type: 'list',
            name: 'selectedMove',
            message: `Select destination for ${piece.type}:`,
            choices: positions,
            loop: false,
            filter: (input: string) => {
                const index = positions.indexOf(input);
                const move = possibleMoves[index];
                console.clear();
                this.game.displayBoard([move]);
                return input;
            }
        });

        // Recreate readline interface
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const index = positions.indexOf(selectedMove);
        return possibleMoves[index];
    }

    public async startGame(): Promise<void> {
        this.game.displayBoard();
        await this.promptMove();
    }

    getGameState(): Game {
        return this.game;
    }

    getBoard(): Board {
        return this.game.board;
    }

    private validateMove(piece: Piece | null, fromX: number, fromY: number, toX: number, toY: number): void {
        this.moveValidator.validateMove(this.game, piece, fromX, fromY, toX, toY);
    }
}

export default GameStateManager;