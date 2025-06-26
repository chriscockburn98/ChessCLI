import Board from '../models/Board.js';
import Piece from '../models/Piece.js';
import { InvalidMoveError } from '../errors/GameErrors.js';

export interface ParsedMove {
    piece: string;
    fromFile?: string;
    fromRank?: string;
    toFile: string;
    toRank: string;
    isCapture: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
    promotion?: string;
    isCastling: boolean;
    castlingSide?: 'kingside' | 'queenside';
}

export interface Coordinates {
    x: number;
    y: number;
}

export default class NotationParser {
    private static readonly FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    private static readonly RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];
    private static readonly PIECES = ['K', 'Q', 'R', 'B', 'N'];

    /**
     * Parse algebraic notation into a structured move object
     */
    static parseAlgebraicNotation(notation: string): ParsedMove {
        // Remove whitespace and normalize
        const cleanNotation = notation.trim();
        
        // Handle castling
        if (cleanNotation === 'O-O' || cleanNotation === '0-0') {
            return {
                piece: 'K',
                toFile: 'g',
                toRank: '1',
                isCapture: false,
                isCheck: false,
                isCheckmate: false,
                isCastling: true,
                castlingSide: 'kingside'
            };
        }
        
        if (cleanNotation === 'O-O-O' || cleanNotation === '0-0-0') {
            return {
                piece: 'K',
                toFile: 'c',
                toRank: '1',
                isCapture: false,
                isCheck: false,
                isCheckmate: false,
                isCastling: true,
                castlingSide: 'queenside'
            };
        }

        let workingNotation = cleanNotation;
        const result: ParsedMove = {
            piece: '',
            fromFile: undefined,
            fromRank: undefined,
            toFile: '',
            toRank: '',
            isCapture: false,
            isCheck: false,
            isCheckmate: false,
            promotion: undefined,
            isCastling: false
        };

        // Check for checkmate
        if (workingNotation.endsWith('#')) {
            result.isCheckmate = true;
            workingNotation = workingNotation.slice(0, -1);
        }
        // Check for check
        else if (workingNotation.endsWith('+')) {
            result.isCheck = true;
            workingNotation = workingNotation.slice(0, -1);
        }

        // Check for pawn promotion
        const promotionMatch = workingNotation.match(/=([QRNB])$/);
        if (promotionMatch) {
            result.promotion = promotionMatch[1];
            workingNotation = workingNotation.replace(/=([QRNB])$/, '');
        }

        // Check for capture
        if (workingNotation.includes('x')) {
            result.isCapture = true;
            workingNotation = workingNotation.replace('x', '');
        }

        // Determine piece type
        if (this.PIECES.includes(workingNotation[0])) {
            result.piece = workingNotation[0];
            workingNotation = workingNotation.slice(1);
        } else {
            // Pawn move
            result.piece = 'P';
        }

        // Extract destination square (last 2 characters)
        if (workingNotation.length < 2) {
            throw new InvalidMoveError(`Invalid notation: ${notation}`);
        }

        const destination = workingNotation.slice(-2);
        if (!this.isValidSquare(destination)) {
            throw new InvalidMoveError(`Invalid destination square: ${destination}`);
        }

        result.toFile = destination[0];
        result.toRank = destination[1];

        // Extract disambiguation (remaining characters)
        const disambiguation = workingNotation.slice(0, -2);
        if (disambiguation.length > 0) {
            if (this.FILES.includes(disambiguation)) {
                result.fromFile = disambiguation;
            } else if (this.RANKS.includes(disambiguation)) {
                result.fromRank = disambiguation;
            } else if (disambiguation.length === 2 && this.isValidSquare(disambiguation)) {
                result.fromFile = disambiguation[0];
                result.fromRank = disambiguation[1];
            } else {
                throw new InvalidMoveError(`Invalid disambiguation: ${disambiguation}`);
            }
        }

        return result;
    }

    /**
     * Convert coordinates to algebraic notation
     */
    static coordinatesToAlgebraic(x: number, y: number): string {
        if (x < 0 || x > 7 || y < 0 || y > 7) {
            throw new InvalidMoveError(`Invalid coordinates: (${x}, ${y})`);
        }
        return this.FILES[x] + this.RANKS[y];
    }

    /**
     * Convert algebraic notation to coordinates
     */
    static algebraicToCoordinates(square: string): Coordinates {
        if (!this.isValidSquare(square)) {
            throw new InvalidMoveError(`Invalid square: ${square}`);
        }
        
        const file = square[0];
        const rank = square[1];
        
        return {
            x: this.FILES.indexOf(file),
            y: this.RANKS.indexOf(rank)
        };
    }

    /**
     * Find the piece that can make the specified move
     */
    static findPieceForMove(board: Board, parsedMove: ParsedMove, color: 'white' | 'black'): Coordinates {
        const targetCoords = this.algebraicToCoordinates(parsedMove.toFile + parsedMove.toRank);
        const possiblePieces: Coordinates[] = [];

        // Search the board for pieces that match the criteria
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = board.getPiece(x, y);
                
                if (!piece || piece.team !== color) continue;
                
                // Check if piece type matches
                const pieceType = this.getPieceNotation(piece);
                if (pieceType !== parsedMove.piece) continue;

                // Check if piece can move to target square
                const possibleMoves = piece.getPossibleMoves(board);
                const canMoveTo = Array.from(possibleMoves).some(move => 
                    move.x === targetCoords.x && move.y === targetCoords.y
                );
                
                if (!canMoveTo) continue;

                // Apply disambiguation filters
                if (parsedMove.fromFile && this.FILES[x] !== parsedMove.fromFile) continue;
                if (parsedMove.fromRank && this.RANKS[y] !== parsedMove.fromRank) continue;

                possiblePieces.push({ x, y });
            }
        }

        if (possiblePieces.length === 0) {
            throw new InvalidMoveError(`No piece can make the move: ${parsedMove.piece}${parsedMove.toFile}${parsedMove.toRank}`);
        }

        if (possiblePieces.length > 1) {
            throw new InvalidMoveError(`Ambiguous move - multiple pieces can make this move: ${parsedMove.piece}${parsedMove.toFile}${parsedMove.toRank}`);
        }

        return possiblePieces[0];
    }

    /**
     * Generate algebraic notation for a move
     */
    static generateAlgebraicNotation(
        board: Board,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        piece: Piece,
        isCapture: boolean = false,
        promotion?: string
    ): string {
        // Handle castling
        if (piece.type === 'king') {
            if (Math.abs(toX - fromX) === 2) {
                return toX > fromX ? 'O-O' : 'O-O-O';
            }
        }

        let notation = '';
        const pieceNotation = this.getPieceNotation(piece);
        
        // Add piece symbol (except for pawns)
        if (pieceNotation !== 'P') {
            notation += pieceNotation;
        }

        // Add disambiguation if needed
        const disambiguation = this.getDisambiguation(board, piece, fromX, fromY, toX, toY);
        notation += disambiguation;

        // Add capture symbol
        if (isCapture) {
            // For pawn captures, include the file
            if (pieceNotation === 'P' && !disambiguation) {
                notation += this.FILES[fromX];
            }
            notation += 'x';
        }

        // Add destination square
        notation += this.coordinatesToAlgebraic(toX, toY);

        // Add promotion
        if (promotion) {
            notation += '=' + promotion;
        }

        return notation;
    }

    /**
     * Check if a square notation is valid
     */
    private static isValidSquare(square: string): boolean {
        return square.length === 2 && 
               this.FILES.includes(square[0]) && 
               this.RANKS.includes(square[1]);
    }

    /**
     * Get algebraic notation for a piece
     */
    private static getPieceNotation(piece: Piece): string {
        switch (piece.type) {
            case 'king': return 'K';
            case 'queen': return 'Q';
            case 'rook': return 'R';
            case 'bishop': return 'B';
            case 'knight': return 'N';
            case 'pawn': return 'P';
            default: throw new InvalidMoveError(`Unknown piece: ${piece.type}`);
        }
    }

    /**
     * Get disambiguation needed for algebraic notation
     */
    private static getDisambiguation(
        board: Board,
        piece: Piece,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number
    ): string {
        // Find other pieces of the same type that can move to the same square
        const sameTypePieces: Coordinates[] = [];
        
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (x === fromX && y === fromY) continue;
                
                const otherPiece = board.getPiece(x, y);
                if (!otherPiece || 
                    otherPiece.team !== piece.team || 
                    otherPiece.type !== piece.type) continue;

                const possibleMoves = otherPiece.getPossibleMoves(board);
                const canMoveTo = Array.from(possibleMoves).some(move => 
                    move.x === toX && move.y === toY
                );
                
                if (canMoveTo) {
                    sameTypePieces.push({ x, y });
                }
            }
        }

        if (sameTypePieces.length === 0) {
            return '';
        }

        // Check if file disambiguation is sufficient
        const sameFile = sameTypePieces.some(p => p.x === fromX);
        if (!sameFile) {
            return this.FILES[fromX];
        }

        // Check if rank disambiguation is sufficient
        const sameRank = sameTypePieces.some(p => p.y === fromY);
        if (!sameRank) {
            return this.RANKS[fromY];
        }

        // Use full square disambiguation
        return this.coordinatesToAlgebraic(fromX, fromY);
    }
}