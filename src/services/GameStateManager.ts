import Board from "../models/Board.js";
import Game from "../models/Game.js";
import Piece from "../models/Piece.js";
import { convertCoordinatesToPosition, convertCoordinatesToPositionArray, convertPositionToCoordinates } from "../utils/helpers.js";
import * as readline from 'readline';
import { InvalidMoveError } from '../errors/GameErrors.js';
import MoveValidator from './MoveValidator.js';
import MoveHistory from './MoveHistory.js';
import inquirer from 'inquirer';
import Pawn from '../models/pieces/Pawn.js';
import chalk from 'chalk';

class GameStateManager {
    private game: Game;
    private rl: readline.Interface;
    private moveValidator: MoveValidator;
    private moveHistory: MoveHistory;

    constructor(game: Game) {
        this.game = game;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.moveValidator = new MoveValidator();
        this.moveHistory = new MoveHistory();
    }

    private async promptMove(): Promise<void> {
        try {
            console.log(`\n${chalk.bold(this.game.currentTeam === 'white' ? '⚪' : '⚫')} ${chalk.cyan(this.game.currentTeam)}'s turn`);
            console.log(chalk.dim('Type "help" for commands, "history" to view moves, or enter piece position (e.g., "e2")'));

            const fromPos = await new Promise<string>((resolve) => {
                this.rl.question('Enter piece position: ', (answer) => {
                    resolve(answer.trim().toLowerCase());
                });
            });

            // Handle special commands
            if (fromPos === 'help') {
                this.showHelp();
                await this.promptMove();
                return;
            }

            if (fromPos === 'history') {
                console.log(this.moveHistory.displayHistory());
                await this.waitForKeyPress();
                console.clear();
                this.game.displayBoard();
                console.log(this.moveHistory.displayRecentMoves());
                await this.promptMove();
                return;
            }

            if (fromPos === 'quit' || fromPos === 'exit') {
                console.log(chalk.yellow('Thanks for playing!'));
                this.rl.close();
                return;
            }

            const { x: fromX, y: fromY } = convertPositionToCoordinates(fromPos);
            const piece = this.game.board.getPiece(fromX, fromY);

            if (!piece) {
                throw new InvalidMoveError(`No piece at position (${fromX}, ${fromY})`);
            }

            // Get and display possible moves
            const possibleMoves = piece.allValidMoves(this.game.board);
            this.game.displayBoard(possibleMoves);

            const positions = convertCoordinatesToPositionArray(possibleMoves);
            console.log(`Possible moves for ${piece.type} at ${fromPos}: ${positions.join(', ')}`);

            // Get move selection using arrow keys
            const selectedMove = await this.promptDestination(piece, possibleMoves);

            // Validate and make the move
            this.validateMove(piece, fromX, fromY, selectedMove.x, selectedMove.y);

            // Check for capture
            const targetPiece = this.game.board.getPiece(selectedMove.x, selectedMove.y);
            const isCapture = targetPiece !== null;

            // Move the piece
            const currentPiece = this.game.board.getPiece(fromX, fromY);
            if (currentPiece) {
                this.game.board.movePiece(currentPiece.x, currentPiece.y, selectedMove.x, selectedMove.y);

                // Handle promotion if applicable
                const movedPiece = this.game.board.getPiece(selectedMove.x, selectedMove.y);
                let promotion: string | undefined;
                if (movedPiece) {
                    promotion = await this.handlePawnPromotion(movedPiece);
                }

                // Check for check/checkmate after move
                const opposingTeam = this.game.currentTeam === 'white' ? 'black' : 'white';
                const isCheck = this.game.board.isKingInCheck(this.game.board.getPieceByType(opposingTeam, 'king')!);
                const isCheckmate = this.game.board.isKingInCheckmate(opposingTeam);

                // Record the move in history
                const moveNumber = this.moveHistory.getCurrentMoveNumber();
                this.moveHistory.addMove(
                    moveNumber,
                    this.game.currentTeam as 'white' | 'black',
                    fromX,
                    fromY,
                    selectedMove.x,
                    selectedMove.y,
                    currentPiece,
                    this.game.board,
                    isCapture,
                    targetPiece || undefined,
                    isCheck,
                    isCheckmate,
                    undefined, // castling detection would need more work
                    promotion
                );

                // Switch turns
                this.game.currentTeam = opposingTeam;

                // Check for checkmate
                if (isCheckmate) {
                    console.clear();
                    this.game.displayBoard();
                    console.log(chalk.red.bold(`\n🏆 CHECKMATE! ${this.game.currentTeam} loses!`));
                    console.log(this.moveHistory.displayHistory());
                    
                    const stats = this.moveHistory.getStatistics();
                    console.log(chalk.cyan(`\n📊 Game Statistics:`));
                    console.log(`   Total moves: ${stats.totalMoves}`);
                    console.log(`   Captures: ${stats.captures}`);
                    console.log(`   Checks: ${stats.checks}`);
                    console.log(`   Game length: ${stats.gameLength}`);
                    
                    this.rl.close();
                    return;
                }

                // Display updated board with move history
                console.clear();
                this.game.displayBoard();
                console.log(this.moveHistory.displayRecentMoves());

                // Continue with next move
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

    getMoveHistory(): MoveHistory {
        return this.moveHistory;
    }

    private validateMove(piece: Piece | null, fromX: number, fromY: number, toX: number, toY: number): void {
        this.moveValidator.validateMove(this.game, piece, fromX, fromY, toX, toY);
    }

    private async handlePawnPromotion(piece: Piece): Promise<string | undefined> {
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
            return promotionPiece;
        }
        return undefined;
    }

    private showHelp(): void {
        console.log(chalk.cyan('\n📖 Game Commands:'));
        console.log(chalk.white('  help     ') + chalk.gray('- Show this help message'));
        console.log(chalk.white('  history  ') + chalk.gray('- View complete move history'));
        console.log(chalk.white('  quit     ') + chalk.gray('- Exit the game'));
        console.log(chalk.white('  e2, d4   ') + chalk.gray('- Move piece (standard chess notation)'));
        console.log(chalk.cyan('\n🎮 How to Play:'));
        console.log(chalk.gray('  1. Enter the position of the piece you want to move (e.g., "e2")'));
        console.log(chalk.gray('  2. Use arrow keys to select destination from highlighted moves'));
        console.log(chalk.gray('  3. Press Enter to confirm your move'));
        console.log(chalk.cyan('\n♟️  Chess Notation:'));
        console.log(chalk.gray('  Files (columns): a-h (left to right)'));
        console.log(chalk.gray('  Ranks (rows): 1-8 (bottom to top)'));
        console.log(chalk.gray('  Example: e4 means column e, row 4\n'));
    }

    private async waitForKeyPress(): Promise<void> {
        console.log(chalk.dim('\nPress any key to continue...'));
        return new Promise((resolve) => {
            const stdin = process.stdin;
            stdin.setRawMode(true);
            stdin.resume();
            stdin.once('data', () => {
                stdin.setRawMode(false);
                stdin.pause();
                resolve();
            });
        });
    }
}

export default GameStateManager;