import type { Board, Cell, Digit } from '../types';

export type HintResult = {
  row: number;
  col: number;
  value: Digit;
  technique: string;
  explanation: string;
};

// Helper function to safely access board cells
function getCell(board: Board, row: number, col: number): Cell | null {
  if (row < 0 || row >= 9 || col < 0 || col >= 9) return null;
  return board[row]?.[col] || null;
}

// Helper function to check if a cell exists and is empty
function isEmptyCell(board: Board, row: number, col: number): boolean {
  const cell = getCell(board, row, col);
  return cell !== null && cell.value === null && !cell.isGiven;
}

// Helper function to get possible values for a cell
function getPossibleValues(board: Board, row: number, col: number): Digit[] {
  const possible: Digit[] = [];
  for (let digit = 1; digit <= 9; digit++) {
    if (isValidPlacement(board, row, col, digit as Digit)) {
      possible.push(digit as Digit);
    }
  }
  return possible;
}

// Helper function to check if a placement is valid
function isValidPlacement(board: Board, row: number, col: number, digit: Digit): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    const cell = getCell(board, row, c);
    if (cell && cell.value === digit) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    const cell = getCell(board, r, col);
    if (cell && cell.value === digit) return false;
  }

  // Check box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      const cell = getCell(board, r, c);
      if (cell && cell.value === digit) return false;
    }
  }

  return true;
}

// Helper function to get cells that can contain a digit in a row
function getCellsForDigitInRow(board: Board, row: number): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let col = 0; col < 9; col++) {
    if (isEmptyCell(board, row, col)) {
      cells.push({ row, col });
    }
  }
  return cells;
}

// Helper function to get cells that can contain a digit in a column
function getCellsForDigitInCol(board: Board, col: number): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < 9; row++) {
    if (isEmptyCell(board, row, col)) {
      cells.push({ row, col });
    }
  }
  return cells;
}

// Helper function to get cells that can contain a digit in a box
function getCellsForDigitInBox(
  board: Board,
  boxRow: number,
  boxCol: number,
): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (isEmptyCell(board, r, c)) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}

export function findLogicHint(board: Board): HintResult | null {
  // Check for naked singles (cells with only one possible value)
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = getCell(board, row, col);
      if (!cell || cell.value !== null || cell.isGiven) continue;

      const possibleValues = getPossibleValues(board, row, col);
      if (possibleValues.length === 1) {
        return {
          row,
          col,
          value: possibleValues[0],
          technique: 'Naked Single',
          explanation: `Cell (${row + 1}, ${col + 1}) can only contain ${possibleValues[0]}`,
        };
      }
    }
  }

  // Check for hidden singles in rows
  for (let row = 0; row < 9; row++) {
    for (let digit = 1; digit <= 9; digit++) {
      const possibleCells = getCellsForDigitInRow(board, row);
      if (possibleCells.length === 1) {
        const { col } = possibleCells[0];
        return {
          row,
          col,
          value: digit as Digit,
          technique: 'Hidden Single (Row)',
          explanation: `${digit} can only go in cell (${row + 1}, ${col + 1}) in row ${row + 1}`,
        };
      }
    }
  }

  // Check for hidden singles in columns
  for (let col = 0; col < 9; col++) {
    for (let digit = 1; digit <= 9; digit++) {
      const possibleCells = getCellsForDigitInCol(board, col);
      if (possibleCells.length === 1) {
        const { row } = possibleCells[0];
        return {
          row,
          col,
          value: digit as Digit,
          technique: 'Hidden Single (Column)',
          explanation: `${digit} can only go in cell (${row + 1}, ${col + 1}) in column ${col + 1}`,
        };
      }
    }
  }

  // Check for hidden singles in boxes
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      for (let digit = 1; digit <= 9; digit++) {
        const possibleCells = getCellsForDigitInBox(board, boxRow, boxCol);
        if (possibleCells.length === 1) {
          const { row, col } = possibleCells[0];
          return {
            row,
            col,
            value: digit as Digit,
            technique: 'Hidden Single (Box)',
            explanation: `${digit} can only go in cell (${row + 1}, ${col + 1}) in box (${Math.floor(boxRow / 3) + 1}, ${Math.floor(boxCol / 3) + 1})`,
          };
        }
      }
    }
  }

  return null;
}
