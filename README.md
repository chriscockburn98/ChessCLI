# ChessCLI

A command-line implementation of chess written in TypeScript. Play chess directly in your terminal with a clean and intuitive interface.

## Features

- **Unicode Chess Pieces**: Enjoy a visually appealing chess experience with Unicode characters.
- **Dynamic Board Display**: The board is displayed dynamically based on the board size.
- **Possible Moves Highlighting**: See highlighted possible moves for each piece.
- **Move Validation**: Ensure all moves are valid and follow the rules of chess.
- **Game State Management**: Manage the game state with ease, including checking for check and checkmate.

## Installation

1. Clone the repository.
2. Run `npm install` to install the dependencies.
3. Run `npm run build` to build the project.
4. Run `chmod +x ./dist/index.js` to make the script executable.
5. Run `chesscli` to play chess.


# Implementation Notes:

- The board is represented as a 2D array of pieces.
- The pieces are represented as classes that inherit from the `Piece` class.
- The `Piece` class has a method `allValidMoves` that returns an array of all valid moves for a piece.
- The `Game` class has a method `displayBoard` that displays the board and highlights the possible moves for each piece.

## Contributing

Contributions are welcome! Please feel free to submit a pull request. To do this, please fork the repository and create a new branch. Then, make your changes and submit a pull request.

## License

This project is open-sourced under the MIT License - see the LICENSE file for details.

