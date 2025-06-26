import inquirer from 'inquirer';
import chalk from 'chalk';
import Game from '../models/Game.js';
import Board from '../models/Board.js';
import GameStateManager from './GameStateManager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Game setup functions
import Pawn from '../models/pieces/Pawn.js';
import Rook from '../models/pieces/Rook.js';
import Knight from '../models/pieces/Knight.js';
import Bishop from '../models/pieces/Bishop.js';
import Queen from '../models/pieces/Queen.js';
import King from '../models/pieces/King.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SavedGame {
    id: string;
    name: string;
    date: string;
    currentTeam: string;
    moves: number;
    boardState: any;
}

interface GameHistory {
    moves: Array<{
        player: string;
        from: string;
        to: string;
        piece: string;
        capture?: boolean;
        notation: string;
        timestamp: Date;
    }>;
}

export default class GameMenuManager {
    private saveDirectory: string;
    private currentGame?: Game;
    private gameStateManager?: GameStateManager;
    private gameHistory: GameHistory = { moves: [] };

    constructor() {
        const homeDir = os.homedir();
        this.saveDirectory = path.join(homeDir, '.chesscli', 'saves');
        this.ensureSaveDirectoryExists();
    }

    private ensureSaveDirectoryExists(): void {
        if (!fs.existsSync(this.saveDirectory)) {
            fs.mkdirSync(this.saveDirectory, { recursive: true });
        }
    }

    async showMainMenu(): Promise<void> {
        console.clear();
        this.showWelcomeBanner();

        const choices = [
            { name: '🎮 New Game', value: 'new' },
            { name: '📂 Load Game', value: 'load' },
            { name: '⚙️  Settings', value: 'settings' },
            { name: '📜 Game Rules', value: 'rules' },
            { name: '📊 Statistics', value: 'stats' },
            { name: '❓ Help', value: 'help' },
            { name: '🚪 Exit', value: 'exit' }
        ];

        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices,
                pageSize: 10
            }
        ]);

        await this.handleMainMenuAction(action);
    }

    private showWelcomeBanner(): void {
        const banner = chalk.cyan(`
╔════════════════════════════════════╗
║            ChessCLI v1.0           ║
║       Command Line Chess Game      ║
╚════════════════════════════════════╝
        `);
        console.log(banner);
    }

    private async handleMainMenuAction(action: string): Promise<void> {
        switch (action) {
            case 'new':
                await this.showNewGameMenu();
                break;
            case 'load':
                await this.showLoadGameMenu();
                break;
            case 'settings':
                await this.showSettingsMenu();
                break;
            case 'rules':
                await this.showRules();
                break;
            case 'stats':
                await this.showStatistics();
                break;
            case 'help':
                await this.showHelp();
                break;
            case 'exit':
                console.log(chalk.yellow('\n👋 Thanks for playing ChessCLI!'));
                process.exit(0);
                break;
        }
    }

    private async showNewGameMenu(): Promise<void> {
        console.clear();
        console.log(chalk.green('🎮 Starting New Game\n'));

        const { gameMode } = await inquirer.prompt([
            {
                type: 'list',
                name: 'gameMode',
                message: 'Select game mode:',
                choices: [
                    { name: '👥 Player vs Player (Local)', value: 'pvp' },
                    { name: '🤖 Player vs AI (Coming Soon)', value: 'ai', disabled: true },
                    { name: '🌐 Online Multiplayer (Coming Soon)', value: 'online', disabled: true },
                    { name: '🔙 Back to Main Menu', value: 'back' }
                ]
            }
        ]);

        if (gameMode === 'back') {
            await this.showMainMenu();
            return;
        }

        if (gameMode === 'pvp') {
            await this.startNewGame();
        }
    }

    private async startNewGame(): Promise<void> {
        console.clear();
        console.log(chalk.green('🏁 Initializing Chess Game...\n'));

        // Create new game
        this.currentGame = new Game(8, 8);
        this.setupStandardChessBoard(this.currentGame);
        this.gameHistory = { moves: [] };

        // Show initial board
        this.currentGame.displayBoard();
        console.log(chalk.blue('\n♔ Welcome to Chess! White moves first.\n'));

        // Show game controls
        this.showGameControls();

        // Start game state manager
        this.gameStateManager = new GameStateManager(this.currentGame);
        await this.gameStateManager.startGame();
    }

    private setupStandardChessBoard(game: Game): void {
        const board = game.board;

        // Add white pieces
        for (let i = 0; i < 8; i++) {
            board.initialisePiece(new Pawn('white'), i, 1);
        }
        board.initialisePiece(new Rook('white'), 0, 0);
        board.initialisePiece(new Rook('white'), 7, 0);
        board.initialisePiece(new Knight('white'), 1, 0);
        board.initialisePiece(new Knight('white'), 6, 0);
        board.initialisePiece(new Bishop('white'), 2, 0);
        board.initialisePiece(new Bishop('white'), 5, 0);
        board.initialisePiece(new Queen('white'), 3, 0);
        board.initialisePiece(new King('white'), 4, 0);

        // Add black pieces
        for (let i = 0; i < 8; i++) {
            board.initialisePiece(new Pawn('black'), i, 6);
        }
        board.initialisePiece(new Rook('black'), 0, 7);
        board.initialisePiece(new Rook('black'), 7, 7);
        board.initialisePiece(new Knight('black'), 1, 7);
        board.initialisePiece(new Knight('black'), 6, 7);
        board.initialisePiece(new Bishop('black'), 2, 7);
        board.initialisePiece(new Bishop('black'), 5, 7);
        board.initialisePiece(new Queen('black'), 3, 7);
        board.initialisePiece(new King('black'), 4, 7);
    }

    private showGameControls(): void {
        const controls = chalk.gray(`
┌─ Game Controls ─────────────────────┐
│ • Type coordinates like 'e2', 'e4' │
│ • Use arrow keys to select moves   │
│ • Type 'menu' to return to menu    │
│ • Type 'save' to save the game     │
│ • Type 'quit' to exit              │
└────────────────────────────────────┘
        `);
        console.log(controls);
    }

    private async showLoadGameMenu(): Promise<void> {
        console.clear();
        console.log(chalk.blue('📂 Load Saved Game\n'));

        const savedGames = this.getSavedGames();

        if (savedGames.length === 0) {
            console.log(chalk.yellow('No saved games found.'));
            await this.waitForKeyPress();
            await this.showMainMenu();
            return;
        }

        const choices = savedGames.map(game => ({
            name: `${game.name} - ${game.date} (${game.moves} moves, ${game.currentTeam} to move)`,
            value: game.id
        }));
        choices.push({ name: '🔙 Back to Main Menu', value: 'back' });

        const { selectedGame } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedGame',
                message: 'Select a saved game:',
                choices,
                pageSize: 10
            }
        ]);

        if (selectedGame === 'back') {
            await this.showMainMenu();
            return;
        }

        await this.loadGame(selectedGame);
    }

    private getSavedGames(): SavedGame[] {
        try {
            const files = fs.readdirSync(this.saveDirectory);
            const savedGames: SavedGame[] = [];

            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const filePath = path.join(this.saveDirectory, file);
                        const content = fs.readFileSync(filePath, 'utf8');
                        const gameData = JSON.parse(content);
                        savedGames.push(gameData);
                    } catch (error) {
                        console.warn(`Failed to load saved game: ${file}`);
                    }
                }
            }

            return savedGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (error) {
            return [];
        }
    }

    async saveGame(name?: string): Promise<void> {
        if (!this.currentGame) {
            console.log(chalk.red('No game to save.'));
            return;
        }

        if (!name) {
            const { gameName } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'gameName',
                    message: 'Enter a name for this saved game:',
                    default: `Game ${new Date().toLocaleString()}`
                }
            ]);
            name = gameName || `Game ${new Date().toLocaleString()}`;
        }

        const gameData: SavedGame = {
            id: Date.now().toString(),
            name: name!,
            date: new Date().toLocaleString(),
            currentTeam: this.currentGame.currentTeam,
            moves: this.gameHistory.moves.length,
            boardState: this.serializeBoardState()
        };

        const fileName = `${gameData.id}.json`;
        const filePath = path.join(this.saveDirectory, fileName);

        try {
            fs.writeFileSync(filePath, JSON.stringify(gameData, null, 2));
            console.log(chalk.green(`✅ Game saved as "${name}"`));
        } catch (error) {
            console.log(chalk.red('❌ Failed to save game.'));
        }
    }

    private async loadGame(gameId: string): Promise<void> {
        try {
            const filePath = path.join(this.saveDirectory, `${gameId}.json`);
            const content = fs.readFileSync(filePath, 'utf8');
            const gameData: SavedGame = JSON.parse(content);

            // Recreate game from saved state
            this.currentGame = new Game(8, 8);
            this.deserializeBoardState(gameData.boardState);
            this.currentGame.currentTeam = gameData.currentTeam;

            console.clear();
            console.log(chalk.green(`📂 Loaded game: ${gameData.name}\n`));
            this.currentGame.displayBoard();
            
            // Continue game
            this.gameStateManager = new GameStateManager(this.currentGame);
            await this.gameStateManager.startGame();

        } catch (error) {
            console.log(chalk.red('❌ Failed to load game.'));
            await this.waitForKeyPress();
            await this.showMainMenu();
        }
    }

    private async showSettingsMenu(): Promise<void> {
        console.clear();
        console.log(chalk.blue('⚙️  Settings\n'));

        const { setting } = await inquirer.prompt([
            {
                type: 'list',
                name: 'setting',
                message: 'Select setting to modify:',
                choices: [
                    { name: '🎨 Board Colors', value: 'colors' },
                    { name: '♟️  Piece Symbols', value: 'symbols' },
                    { name: '📺 Display Preferences', value: 'display' },
                    { name: '🔊 Sound Effects (Coming Soon)', value: 'sound', disabled: true },
                    { name: '🔙 Back to Main Menu', value: 'back' }
                ]
            }
        ]);

        if (setting === 'back') {
            await this.showMainMenu();
        } else {
            console.log(chalk.yellow('Settings will be implemented in a future version.'));
            await this.waitForKeyPress();
            await this.showSettingsMenu();
        }
    }

    private async showRules(): Promise<void> {
        console.clear();
        console.log(chalk.cyan('📜 Chess Rules\n'));

        const rules = `
${chalk.bold('Basic Chess Rules:')}

${chalk.yellow('Objective:')} Checkmate the opponent's king.

${chalk.yellow('Piece Movement:')}
• ♔ King: One square in any direction
• ♕ Queen: Any number of squares diagonally, horizontally, or vertically
• ♖ Rook: Any number of squares horizontally or vertically
• ♗ Bishop: Any number of squares diagonally
• ♘ Knight: L-shaped move (2+1 squares)
• ♙ Pawn: Forward one square, or two on first move. Captures diagonally.

${chalk.yellow('Special Moves:')}
• Castling: King and rook special move
• En passant: Special pawn capture
• Pawn promotion: Pawn reaching end promotes to any piece

${chalk.yellow('Game End:')}
• Checkmate: King is attacked and cannot escape
• Stalemate: No legal moves available (draw)
• Draw: By agreement, repetition, or insufficient material
        `;

        console.log(rules);
        await this.waitForKeyPress();
        await this.showMainMenu();
    }

    private async showStatistics(): Promise<void> {
        console.clear();
        console.log(chalk.cyan('📊 Statistics\n'));

        // This would track wins/losses/draws in a future version
        const stats = `
${chalk.yellow('Game Statistics:')}

Total Games Played: ${this.getSavedGames().length}
Games Won: -
Games Lost: -
Games Drawn: -

${chalk.dim('Detailed statistics will be available in a future version.')}
        `;

        console.log(stats);
        await this.waitForKeyPress();
        await this.showMainMenu();
    }

    private async showHelp(): Promise<void> {
        console.clear();
        console.log(chalk.cyan('❓ Help\n'));

        const help = `
${chalk.bold('How to Play:')}

1. Select a piece by entering its position (e.g., 'e2')
2. Choose from the highlighted possible moves
3. Use arrow keys to navigate move options
4. Press Enter to confirm your move

${chalk.bold('Commands:')}
• Type coordinates like 'e2', 'e4' to select squares
• 'menu' - Return to main menu
• 'save' - Save current game
• 'quit' - Exit the game

${chalk.bold('Notation:')}
Chess positions use algebraic notation:
• Files (columns): a-h (left to right)
• Ranks (rows): 1-8 (bottom to top)
• Example: 'e4' means column e, row 4

${chalk.bold('Tips:')}
• Look for possible moves highlighted in green
• Protect your king from check
• Try to control the center of the board
• Develop your pieces early in the game
        `;

        console.log(help);
        await this.waitForKeyPress();
        await this.showMainMenu();
    }

    private async waitForKeyPress(): Promise<void> {
        console.log(chalk.gray('\nPress any key to continue...'));
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

    private serializeBoardState(): any {
        if (!this.currentGame) return null;

        const boardState = [];
        for (let y = 0; y < 8; y++) {
            const row = [];
            for (let x = 0; x < 8; x++) {
                const piece = this.currentGame.board.getPiece(x, y);
                if (piece) {
                    row.push({
                        type: piece.type,
                        team: piece.team,
                        hasMoved: piece.hasMoved
                    });
                } else {
                    row.push(null);
                }
            }
            boardState.push(row);
        }
        return boardState;
    }

    private deserializeBoardState(boardState: any): void {
        if (!this.currentGame || !boardState) return;

        // Clear the board first - we'll just create a new board
        this.currentGame.board = new Board(8, 8);

        // Restore pieces
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const pieceData = boardState[y][x];
                if (pieceData) {
                    const piece = this.createPieceFromData(pieceData);
                    if (piece) {
                        piece.hasMoved = pieceData.hasMoved;
                        this.currentGame.board.initialisePiece(piece, x, y);
                    }
                }
            }
        }
    }

    private createPieceFromData(pieceData: any): any {
        const { type, team } = pieceData;
        
        switch (type) {
            case 'king': return new King(team);
            case 'queen': return new Queen(team);
            case 'rook': return new Rook(team);
            case 'bishop': return new Bishop(team);
            case 'knight': return new Knight(team);
            case 'pawn': return new Pawn(team);
            default: return null;
        }
    }
}