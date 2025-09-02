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

// Helper function to safely access board cells
function getCell(board: Board, row: number, col: number) {
  if (row < 0 || row >= 9 || col < 0 || col >= 9) return null;
  return board[row]?.[col] || null;
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

// Helper function to check if a solution is valid
function checkIfValidSolution(board: Board, row: number, col: number, digit: Digit): boolean {
  // Create a temporary board with the digit placed
  const tempBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const cell = getCell(tempBoard, row, col);
  if (cell) {
    cell.value = digit;
  }

  // Check if this creates any conflicts
  return isValidPlacement(tempBoard, row, col, digit);
}

/**
 * Get a direct hint by finding a cell that can be filled with a specific digit.
 * This implements the "Direct Number Placement" hint from the MVP requirements.
 */
export function getDirectHint(board: Board, config: GameConfig, hintsUsed: number): HintResponse {
  if (!areHintsAvailable(config.difficulty, hintsUsed)) {
    return {
      success: false,
      reason: 'no-hints-available',
    };
  }

  // Find an empty cell and a valid digit for it
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = getCell(board, row, col);
      if (!cell || cell.value !== null || cell.isGiven) continue;

      // Try each digit to see if it's valid
      for (let digit = 1; digit <= 9; digit++) {
        if (isValidPlacement(board, row, col, digit as Digit)) {
          const isValidSolution = checkIfValidSolution(board, row, col, digit as Digit);
          if (isValidSolution) {
            return {
              success: true,
              hintType: 'direct',
              row,
              col,
              value: digit as Digit,
              hintsRemaining: Math.max(0, config.maxLives - hintsUsed - 1),
              hintsUsed: hintsUsed + 1,
            };
          }
        }
      }
    }
  }

  return {
    success: false,
    reason: 'no-logic-hint-found',
  };
}

/**
 * Get a logic-based hint using the hint engine.
 * This implements the "Logic guidance hint" from the MVP requirements.
 */
export function getLogicHint(board: Board, config: GameConfig, hintsUsed: number): HintResponse {
  if (!areHintsAvailable(config.difficulty, hintsUsed)) {
    return {
      success: false,
      reason: 'no-hints-available',
    };
  }

  const hint = findLogicHint(board);
  if (!hint) {
    return {
      success: false,
      reason: 'no-logic-hint-found',
    };
  }

  return {
    success: true,
    hintType: 'logic',
    row: hint.row,
    col: hint.col,
    value: hint.value,
    technique: hint.technique,
    explanation: hint.explanation,
    hintsRemaining: Math.max(0, config.maxLives - hintsUsed - 1),
    hintsUsed: hintsUsed + 1,
  };
}

/**
 * Check if hints are available for a given difficulty and current usage.
 */
export function canUseHint(difficulty: GameConfig['difficulty'], hintsUsed: number): boolean {
  return areHintsAvailable(difficulty, hintsUsed);
}
