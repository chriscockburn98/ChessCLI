import Board from "@/models/Board.js";
import Game from "@/models/Game.js";
import Piece from "@/models/Piece.js";
import { convertCoordinatesToPosition, convertCoordinatesToPositionArray, convertPositionToCoordinates } from "../utils/helpers.js";
import * as readline from 'readline';
import { InvalidMoveError } from '../errors/GameErrors.js';
import MoveValidator from './MoveValidator.js';
import inquirer from 'inquirer';
import Pawn from '@/models/pieces/Pawn.js';

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

                // Handle promotion if applicable
                const movedPiece = this.game.board.getPiece(selectedMove.x, selectedMove.y);
                if (movedPiece) {
                    await this.handlePawnPromotion(movedPiece);
                }

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

                // Continue with next move - Make sure this is called
                await this.promptMove();
            }

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

        // Add "Back" option to the choices
        const choices = ['← Back', ...positions];

        const { selectedMove } = await inquirer.prompt<{ selectedMove: string }>({
            type: 'list',
            name: 'selectedMove',
            message: `Select destination for ${piece.type}:`,
            choices: choices,
            loop: false,
            filter: (input: string) => {
                if (input === '← Back') return input;
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

        // If user selected "Back", throw a special error to handle it
        if (selectedMove === '← Back') {
            throw new InvalidMoveError('User requested to select different piece');
        }

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

    private async handlePawnPromotion(piece: Piece): Promise<void> {
        if (piece.type === 'pawn' && (piece as Pawn).canPromote()) {
            const { promotionPiece } = await inquirer.prompt<{ promotionPiece: string }>({
                type: 'list',
                name: 'promotionPiece',
                message: 'Choose piece for pawn promotion:',
                choices: [
                    {
                        name: '♛ Queen - Most powerful piece, moves in any direction',
                        value: 'queen'
                    },
                    {
                        name: '♜ Rook - Moves horizontally and vertically',
                        value: 'rook'
                    },
                    {
                        name: '♝ Bishop - Moves diagonally',
                        value: 'bishop'
                    },
                    {
                        name: '♞ Knight - Moves in L-shape, can jump over pieces',
                        value: 'knight'
                    }
                ],
                loop: false
            });

            this.game.board.promotePawn(piece, promotionPiece);
            console.log(`\nPawn promoted to ${promotionPiece}!`);
        }
    }
}

export default GameStateManager;