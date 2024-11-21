import { Command } from 'commander';
import Game from './models/Game.js';
import Pawn from './models/pieces/Pawn.js';
import Rook from './models/pieces/Rook.js';
import Knight from './models/pieces/Knight.js';
import Bishop from './models/pieces/Bishop.js';
import Queen from './models/pieces/Queen.js';
import King from './models/pieces/King.js';
import GameStateManager from './services/GameStateManager.js';

const program = new Command();

program
  .version('1.0.0')
  .description('Chess CLI')
  .option('-n, --name <type>', 'Add your name')
  .action(() => {
    const game = new Game();

    // Add white pieces
    // Pawns
    for (let i = 0; i < 8; i++) {
      game.addPiece(new Pawn(i, 1, 'white'));
    }
    // Other pieces
    game.addPiece(new Rook(0, 0, 'white'));
    game.addPiece(new Rook(7, 0, 'white'));
    game.addPiece(new Knight(1, 0, 'white'));
    game.addPiece(new Knight(6, 0, 'white'));
    game.addPiece(new Bishop(2, 0, 'white'));
    game.addPiece(new Bishop(5, 0, 'white'));
    game.addPiece(new Queen(3, 0, 'white'));
    game.addPiece(new King(4, 0, 'white'));

    // Add black pieces
    // Pawns
    for (let i = 0; i < 8; i++) {
      game.addPiece(new Pawn(i, 6, 'black'));
    }
    // Other pieces
    game.addPiece(new Rook(0, 7, 'black'));
    game.addPiece(new Rook(7, 7, 'black'));
    game.addPiece(new Knight(1, 7, 'black'));
    game.addPiece(new Knight(6, 7, 'black'));
    game.addPiece(new Bishop(2, 7, 'black'));
    game.addPiece(new Bishop(5, 7, 'black'));
    game.addPiece(new Queen(3, 7, 'black'));
    game.addPiece(new King(4, 7, 'black'));

    const gameStateManager = new GameStateManager(game);

    gameStateManager.startGame();

  });

program.parse(process.argv);