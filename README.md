# Sudoku Game

A modern, interactive Sudoku game built with HTML, CSS, and JavaScript. Features a clean, responsive design with smooth animations and intuitive gameplay.

## Features

- **Multiple Difficulty Levels**: Easy, Medium, Hard, and Expert
- **Real-time Timer**: Track your solving time
- **Interactive Gameplay**: Click cells to select, use number pad or keyboard input
- **Smart Highlighting**: Related cells (same row, column, and 3x3 box) are highlighted when selected
- **Error Detection**: Incorrect numbers are highlighted in red
- **Game Controls**:
  - **New Game**: Start a new puzzle with selected difficulty
  - **Solve**: Automatically solve the current puzzle
  - **Check**: Verify if your current solution is correct
  - **Clear**: Clear all non-initial numbers from the board
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Keyboard Support**: Use arrow keys to navigate and number keys to input values
- **Game Completion**: Modal popup when puzzle is solved

## How to Play

1. **Open the Game**: Open `index.html` in your web browser
2. **Select Difficulty**: Choose from Easy, Medium, Hard, or Expert
3. **Start Playing**: 
   - Click on any empty cell to select it
   - Use the number pad or keyboard to input numbers (1-9)
   - Use the "Clear" button or Backspace/Delete to remove numbers
4. **Game Controls**:
   - Use arrow keys to navigate between cells
   - Click "Check" to verify your progress
   - Click "Solve" if you get stuck
   - Click "New Game" to start over

## Game Rules

- Fill the 9x9 grid with numbers 1-9
- Each row must contain all numbers 1-9 without repetition
- Each column must contain all numbers 1-9 without repetition
- Each 3x3 box must contain all numbers 1-9 without repetition
- The puzzle is complete when all cells are filled correctly

## Technical Details

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Architecture**: Object-oriented design with a main `SudokuGame` class
- **Puzzle Generation**: Uses a backtracking algorithm to generate valid Sudoku puzzles
- **Styling**: Modern CSS with gradients, shadows, and smooth transitions
- **Responsive**: Mobile-first design with breakpoints for different screen sizes

## File Structure

```
sudoku/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript game logic
└── README.md          # This file
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Getting Started

1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start playing!

## Future Enhancements

- Save/load game progress
- Statistics tracking
- Multiple puzzle themes
- Sound effects
- Undo/redo functionality
- Hint system

## License

This project is open source and available under the MIT License.
