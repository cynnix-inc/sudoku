import type { Board, Digit, GameConfig } from '../game/types';
import { findLogicHint } from '../game/engine/hint-engine';
import { areHintsAvailable } from '../game/engine/hint-limits';

export type HintType = 'direct' | 'logic';

export type HintResponse =
  | {
      success: true;
      hintType: HintType;
      row: number;
      col: number;
      value: Digit;
      technique?: string;
      explanation?: string;
      hintsRemaining: number;
      hintsUsed: number;
    }
  | {
      success: false;
      reason: 'no-hints-available' | 'no-logic-hint-found' | 'invalid-difficulty';
    };

/**
 * Get a direct hint by finding a cell that can be solved.
 * This places the correct value directly in the cell.
 */
export function getDirectHint(board: Board): HintResponse | null {
  // Find an empty cell that can be solved
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = board[row][col];
      if (cell.value !== null || cell.isGiven) continue;

      // Try each digit to see if it's valid
      for (let digit = 1; digit <= 9; digit++) {
        if (isValidPlacement(board, row, col, digit)) {
          // Check if this is the only valid placement (solve the cell)
          const isValidSolution = checkIfValidSolution(board, row, col, digit);
          if (isValidSolution) {
            return {
              success: true,
              hintType: 'direct',
              row,
              col,
              value: digit,
              hintsRemaining: 0, // Will be updated by caller
              hintsUsed: 0, // Will be updated by caller
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Get a logic hint that explains how to solve a cell.
 * This provides guidance without directly placing the value.
 */
export function getLogicHint(board: Board): HintResponse | null {
  const hint = findLogicHint(board);
  if (!hint || hint.type !== 'logic') {
    return null;
  }

  return {
    success: true,
    hintType: 'logic',
    row: hint.row,
    col: hint.col,
    value: hint.value,
    technique: hint.technique,
    explanation: hint.explanation,
    hintsRemaining: 0, // Will be updated by caller
    hintsUsed: 0, // Will be updated by caller
  };
}

/**
 * Check if a digit placement is a valid solution for a cell.
 * This is a simplified check - in a real implementation, you'd want to verify
 * that the puzzle has a unique solution.
 */
function checkIfValidSolution(board: Board, row: number, col: number, digit: Digit): boolean {
  // For MVP, we'll use a simple heuristic: if this is the only valid digit for this cell
  // and placing it doesn't create obvious conflicts, consider it a solution

  // Check if this is the only valid digit for this cell
  let validDigits = 0;
  for (let d = 1; d <= 9; d++) {
    if (isValidPlacement(board, row, col, d)) {
      validDigits++;
      if (validDigits > 1) break;
    }
  }

  // Also verify that the specific digit we're checking is valid
  return validDigits === 1 && isValidPlacement(board, row, col, digit);
}

/**
 * Check if a digit can be placed in a cell without violating sudoku rules.
 */
function isValidPlacement(board: Board, row: number, col: number, digit: Digit): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c].value === digit) {
      return false;
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col].value === digit) {
      return false;
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c].value === digit) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if hints are available for a given difficulty and current usage.
 */
export function canUseHint(difficulty: GameConfig['difficulty'], hintsUsed: number): boolean {
  return areHintsAvailable(difficulty, hintsUsed);
}
