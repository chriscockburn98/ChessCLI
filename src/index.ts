#!/usr/bin/env node --loader ts-node/esm
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
  .action(() => {
    try {
      const game = new Game(8, 8);

      // Add white pieces
      // Pawns
      for (let i = 0; i < 8; i++) {
        game.board.initialisePiece(new Pawn('white'), i, 1);
      }
      // Other pieces
      game.board.initialisePiece(new Rook('white'), 0, 0);
      game.board.initialisePiece(new Rook('white'), 7, 0);
      game.board.initialisePiece(new Knight('white'), 1, 0);
      game.board.initialisePiece(new Knight('white'), 6, 0);
      game.board.initialisePiece(new Bishop('white'), 2, 0);
      game.board.initialisePiece(new Bishop('white'), 5, 0);
      game.board.initialisePiece(new Queen('white'), 3, 0);
      game.board.initialisePiece(new King('white'), 4, 0);

      // Add black pieces
      // Pawns
      for (let i = 0; i < 8; i++) {
        game.board.initialisePiece(new Pawn('black'), i, 6);
      }
      // Other pieces
      game.board.initialisePiece(new Rook('black'), 0, 7);
      game.board.initialisePiece(new Rook('black'), 7, 7);
      game.board.initialisePiece(new Knight('black'), 1, 7);
      game.board.initialisePiece(new Knight('black'), 6, 7);
      game.board.initialisePiece(new Bishop('black'), 2, 7);
      game.board.initialisePiece(new Bishop('black'), 5, 7);
      game.board.initialisePiece(new Queen('black'), 3, 7);
      game.board.initialisePiece(new King('black'), 4, 7);

      const gameStateManager = new GameStateManager(game);
      gameStateManager.startGame();

      // Add proper exit handling
      process.on('exit', () => {
        console.log('Exiting game...');
      });

    } catch (error) {
      console.error('An error occurred while running the game:');
      console.error(error);
      process.exit(1);
    }
  })


program.parse(process.argv);