import type { Board, Digit } from '../types';
import { isValidPlacement } from '../rules';

export type HintResult =
  | {
      type: 'logic';
      row: number;
      col: number;
      value: Digit;
      technique: string;
      explanation: string;
    }
  | {
      type: 'direct';
      row: number;
      col: number;
      value: Digit;
    };

/**
 * Find a cell that can be solved using basic logic techniques.
 * This implements the "Logic guidance hint" from the MVP requirements.
 */
export function findLogicHint(board: Board): HintResult | null {
  // Look for naked singles (cells with only one possible value)
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = board[row][col];
      if (cell.value !== null || cell.isGiven) continue;

      const possibleValues = getPossibleValues(board, row, col);
      if (possibleValues.length === 1) {
        return {
          type: 'logic',
          row,
          col,
          value: possibleValues[0],
          technique: 'Naked Single',
          explanation: `Cell (${row + 1}, ${col + 1}) can only contain ${possibleValues[0]}`,
        };
      }
    }
  }

  // Look for hidden singles (only one cell in a row/col/box can contain a value)
  for (let digit = 1; digit <= 9; digit++) {
    // Check rows
    for (let row = 0; row < 9; row++) {
      const possibleCells = getCellsForDigitInRow(board, row, digit);
      if (possibleCells.length === 1) {
        const [col] = possibleCells;
        if (board[row][col].value === null && !board[row][col].isGiven) {
          return {
            type: 'logic',
            row,
            col,
            value: digit,
            technique: 'Hidden Single (Row)',
            explanation: `${digit} can only go in cell (${row + 1}, ${col + 1}) in row ${row + 1}`,
          };
        }
      }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      const possibleCells = getCellsForDigitInCol(board, col, digit);
      if (possibleCells.length === 1) {
        const [row] = possibleCells;
        if (board[row][col].value === null && !board[row][col].isGiven) {
          return {
            type: 'logic',
            row,
            col,
            value: digit,
            technique: 'Hidden Single (Column)',
            explanation: `${digit} can only go in cell (${row + 1}, ${col + 1}) in column ${col + 1}`,
          };
        }
      }
    }

    // Check boxes
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
      for (let boxCol = 0; boxCol < 9; boxCol += 3) {
        const possibleCells = getCellsForDigitInBox(board, boxRow, boxCol, digit);
        if (possibleCells.length === 1) {
          const [row, col] = possibleCells;
          if (board[row][col].value === null && !board[row][col].isGiven) {
            return {
              type: 'logic',
              row,
              col,
              value: digit,
              technique: 'Hidden Single (Box)',
              explanation: `${digit} can only go in cell (${row + 1}, ${col + 1}) in box (${Math.floor(boxRow / 3) + 1}, ${Math.floor(boxCol / 3) + 1})`,
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Get all possible values for a cell based on sudoku rules.
 */
function getPossibleValues(board: Board, row: number, col: number): Digit[] {
  const possible: Digit[] = [];

  for (let digit = 1; digit <= 9; digit++) {
    if (isValidPlacement(board, row, col, digit)) {
      possible.push(digit);
    }
  }

  return possible;
}

/**
 * Get all cells in a row where a digit could potentially be placed.
 */
function getCellsForDigitInRow(board: Board, row: number, digit: Digit): number[] {
  const cells: number[] = [];

  for (let col = 0; col < 9; col++) {
    const cell = board[row][col];
    if (cell.value === null && !cell.isGiven && isValidPlacement(board, row, col, digit)) {
      cells.push(col);
    }
  }

  return cells;
}

/**
 * Get all cells in a column where a digit could potentially be placed.
 */
function getCellsForDigitInCol(board: Board, col: number, digit: Digit): number[] {
  const cells: number[] = [];

  for (let row = 0; row < 9; row++) {
    const cell = board[row][col];
    if (cell.value === null && !cell.isGiven && isValidPlacement(board, row, col, digit)) {
      cells.push(row);
    }
  }

  return cells;
}

/**
 * Get all cells in a 3x3 box where a digit could potentially be placed.
 */
function getCellsForDigitInBox(
  board: Board,
  boxRow: number,
  boxCol: number,
  digit: Digit,
): [number, number][] {
  const cells: [number, number][] = [];

  for (let row = boxRow; row < boxRow + 3; row++) {
    for (let col = boxCol; col < boxCol + 3; col++) {
      const cell = board[row][col];
      if (cell.value === null && !cell.isGiven && isValidPlacement(board, row, col, digit)) {
        cells.push([row, col]);
      }
    }
  }

  return cells;
}
