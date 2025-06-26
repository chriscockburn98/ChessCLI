#!/usr/bin/env node --loader ts-node/esm
import { Command } from 'commander';
import GameMenuManager from './services/GameMenuManager.js';

const program = new Command();

program
  .version('1.0.0')
  .description('Chess CLI - A beautiful command-line chess experience')
  .option('-q, --quick', 'Start a quick game without menu')
  .action(async (options) => {
    try {
      const menuManager = new GameMenuManager();
      
      if (options.quick) {
        // Quick start - bypass menu for development/testing
        console.log('Starting quick game...');
        await menuManager['startNewGame']();
      } else {
        // Show main menu
        await menuManager.showMainMenu();
      }

      // Add proper exit handling
      process.on('exit', () => {
        console.log('\n👋 Thanks for playing ChessCLI!');
      });

      process.on('SIGINT', () => {
        console.log('\n\n🛑 Game interrupted');
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ An error occurred while running the game:');
      console.error(error);
      process.exit(1);
    }
  });

program.parse(process.argv);