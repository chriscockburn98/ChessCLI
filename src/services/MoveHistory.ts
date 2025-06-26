import chalk from 'chalk';
import NotationParser from './NotationParser.js';
import Board from '../models/Board.js';
import Piece from '../models/Piece.js';

export interface MoveRecord {
    moveNumber: number;
    player: 'white' | 'black';
    from: { x: number; y: number };
    to: { x: number; y: number };
    piece: string;
    capture?: boolean;
    check?: boolean;
    checkmate?: boolean;
    castling?: 'kingside' | 'queenside';
    promotion?: string;
    notation: string;
    timestamp: Date;
    capturedPiece?: string;
}

export default class MoveHistory {
    private moves: MoveRecord[] = [];
    private currentMoveIndex: number = -1;

    /**
     * Add a new move to the history
     */
    addMove(
        moveNumber: number,
        player: 'white' | 'black',
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        piece: Piece,
        board: Board,
        capture?: boolean,
        capturedPiece?: Piece,
        check?: boolean,
        checkmate?: boolean,
        castling?: 'kingside' | 'queenside',
        promotion?: string
    ): void {
        // Generate algebraic notation
        const notation = NotationParser.generateAlgebraicNotation(
            board,
            fromX,
            fromY,
            toX,
            toY,
            piece,
            capture || false,
            promotion
        );

        const move: MoveRecord = {
            moveNumber,
            player,
            from: { x: fromX, y: fromY },
            to: { x: toX, y: toY },
            piece: piece.type,
            capture: capture || false,
            check: check || false,
            checkmate: checkmate || false,
            castling,
            promotion,
            notation,
            timestamp: new Date(),
            capturedPiece: capturedPiece?.type
        };

        this.moves.push(move);
        this.currentMoveIndex = this.moves.length - 1;
    }

    /**
     * Get all moves in the history
     */
    getAllMoves(): MoveRecord[] {
        return [...this.moves];
    }

    /**
     * Get the current move number
     */
    getCurrentMoveNumber(): number {
        return Math.floor(this.moves.length / 2) + 1;
    }

    /**
     * Get the last move
     */
    getLastMove(): MoveRecord | null {
        return this.moves.length > 0 ? this.moves[this.moves.length - 1] : null;
    }

    /**
     * Display move history in a formatted way
     */
    displayHistory(startFrom: number = 0, maxMoves: number = 20): string {
        if (this.moves.length === 0) {
            return chalk.gray('No moves played yet.');
        }

        let display = chalk.cyan.bold('\n📜 Move History\n');
        display += chalk.gray('─'.repeat(50)) + '\n';

        const endIndex = Math.min(startFrom + maxMoves * 2, this.moves.length);
        
        for (let i = startFrom; i < endIndex; i += 2) {
            const whiteMove = this.moves[i];
            const blackMove = i + 1 < this.moves.length ? this.moves[i + 1] : null;
            
            const moveNumber = Math.floor(i / 2) + 1;
            let moveStr = chalk.white(`${moveNumber}.`.padEnd(4));
            
            // White move
            let whiteNotation = whiteMove.notation;
            if (whiteMove.check) whiteNotation += '+';
            if (whiteMove.checkmate) whiteNotation += '#';
            
            moveStr += chalk.white(whiteNotation.padEnd(8));
            
            // Black move
            if (blackMove) {
                let blackNotation = blackMove.notation;
                if (blackMove.check) blackNotation += '+';
                if (blackMove.checkmate) blackNotation += '#';
                
                moveStr += chalk.gray(blackNotation.padEnd(8));
            }
            
            // Add timing and annotations
            const duration = whiteMove.timestamp.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
            moveStr += chalk.dim(`  ${duration}`);
            
            // Highlight captures
            if (whiteMove.capture) {
                moveStr += chalk.red(' ⚔️');
            }
            if (blackMove?.capture) {
                moveStr += chalk.red(' ⚔️');
            }
            
            // Highlight checks/checkmates
            if (whiteMove.checkmate || blackMove?.checkmate) {
                moveStr += chalk.red.bold(' 👑');
            } else if (whiteMove.check || blackMove?.check) {
                moveStr += chalk.yellow(' ⚠️');
            }
            
            display += moveStr + '\n';
        }
        
        if (endIndex < this.moves.length) {
            display += chalk.dim(`... and ${this.moves.length - endIndex} more moves\n`);
        }
        
        display += chalk.gray('─'.repeat(50)) + '\n';
        display += chalk.dim(`Total: ${this.moves.length} moves`);
        
        return display;
    }

    /**
     * Display compact move history (recent moves only)
     */
    displayRecentMoves(count: number = 6): string {
        if (this.moves.length === 0) {
            return '';
        }

        const recentMoves = this.moves.slice(-count);
        let display = chalk.dim('Recent: ');
        
        for (let i = 0; i < recentMoves.length; i++) {
            const move = recentMoves[i];
            const moveNumber = Math.floor((this.moves.length - count + i) / 2) + 1;
            
            if (i % 2 === 0) {
                // White move
                display += chalk.white(`${moveNumber}.${move.notation} `);
            } else {
                // Black move
                display += chalk.gray(`${move.notation} `);
            }
        }
        
        return display.trim();
    }

    /**
     * Get move statistics
     */
    getStatistics() {
        const stats = {
            totalMoves: this.moves.length,
            captures: this.moves.filter(m => m.capture).length,
            checks: this.moves.filter(m => m.check).length,
            castles: this.moves.filter(m => m.castling).length,
            promotions: this.moves.filter(m => m.promotion).length,
            averageTimePerMove: 0,
            gameLength: '0 minutes'
        };

        if (this.moves.length > 1) {
            const start = this.moves[0].timestamp;
            const end = this.moves[this.moves.length - 1].timestamp;
            const duration = end.getTime() - start.getTime();
            stats.averageTimePerMove = duration / this.moves.length / 1000; // seconds
            stats.gameLength = `${Math.round(duration / 60000)} minutes`;
        }

        return stats;
    }

    /**
     * Export history in PGN (Portable Game Notation) format
     */
    exportToPGN(whitePlayer: string = 'White', blackPlayer: string = 'Black', result: string = '*'): string {
        const date = new Date().toISOString().split('T')[0];
        
        let pgn = `[Event "ChessCLI Game"]\n`;
        pgn += `[Site "Local"]\n`;
        pgn += `[Date "${date}"]\n`;
        pgn += `[Round "1"]\n`;
        pgn += `[White "${whitePlayer}"]\n`;
        pgn += `[Black "${blackPlayer}"]\n`;
        pgn += `[Result "${result}"]\n\n`;

        // Add moves
        for (let i = 0; i < this.moves.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = this.moves[i];
            const blackMove = i + 1 < this.moves.length ? this.moves[i + 1] : null;

            pgn += `${moveNumber}. ${whiteMove.notation}`;
            if (blackMove) {
                pgn += ` ${blackMove.notation}`;
            }
            pgn += ' ';

            // Line break every 8 moves for readability
            if (moveNumber % 8 === 0) {
                pgn += '\n';
            }
        }

        pgn += ` ${result}\n`;
        return pgn;
    }

    /**
     * Clear all history
     */
    clear(): void {
        this.moves = [];
        this.currentMoveIndex = -1;
    }

    /**
     * Get move count for specific player
     */
    getMoveCount(player: 'white' | 'black'): number {
        return this.moves.filter(move => move.player === player).length;
    }

    /**
     * Check if we can navigate backward
     */
    canNavigateBack(): boolean {
        return this.currentMoveIndex > 0;
    }

    /**
     * Check if we can navigate forward
     */
    canNavigateForward(): boolean {
        return this.currentMoveIndex < this.moves.length - 1;
    }

    /**
     * Navigate to previous move
     */
    navigateBack(): MoveRecord | null {
        if (this.canNavigateBack()) {
            this.currentMoveIndex--;
            return this.moves[this.currentMoveIndex];
        }
        return null;
    }

    /**
     * Navigate to next move
     */
    navigateForward(): MoveRecord | null {
        if (this.canNavigateForward()) {
            this.currentMoveIndex++;
            return this.moves[this.currentMoveIndex];
        }
        return null;
    }

    /**
     * Navigate to specific move
     */
    navigateToMove(index: number): MoveRecord | null {
        if (index >= 0 && index < this.moves.length) {
            this.currentMoveIndex = index;
            return this.moves[index];
        }
        return null;
    }

    /**
     * Get current position in navigation
     */
    getCurrentPosition(): { current: number; total: number } {
        return {
            current: this.currentMoveIndex + 1,
            total: this.moves.length
        };
    }
}