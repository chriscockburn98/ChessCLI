export class GameError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GameError';
    }
}

export class InvalidMoveError extends GameError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidMoveError';
    }
}