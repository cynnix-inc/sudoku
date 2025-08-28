import type { Board, Cell, Digit, GameAction, GameConfig, GameState } from './types';
import { isValidPlacement } from './rules';
import { getHintLimit } from './engine/hint-limits';

export function createEmptyBoard(): Board {
  const board: Board = [];
  for (let r = 0; r < 9; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < 9; c++) {
      row.push({ row: r, col: c, value: null, notes: {}, isGiven: false, isError: false });
    }
    board.push(row);
  }
  return board;
}

export function getCell(board: Board, row: number, col: number): Cell {
  if (row < 0 || row > 8 || col < 0 || col > 8) {
    throw new Error(`Cell out of bounds: (${row}, ${col})`);
  }
  const rowCells = board[row];
  if (!rowCells) throw new Error(`Missing row at (${row})`);
  const cell = rowCells[col];
  if (!cell) throw new Error(`Missing cell at (${row}, ${col})`);
  return cell;
}

export function initializeGame(
  givens: { row: number; col: number; value: Digit }[],
  config: GameConfig,
): GameState {
  const board = createEmptyBoard();
  for (const g of givens) {
    const cell = getCell(board, g.row, g.col);
    cell.value = g.value;
    cell.isGiven = true;
    cell.notes = {};
    cell.isError = false;
  }

  const hintLimit = getHintLimit(config.difficulty);
  return {
    board,
    givens: [...givens],
    config,
    livesRemaining: config.maxLives,
    history: { past: [], future: [] },
    hintState: {
      hintsUsed: 0,
      hintsRemaining: hintLimit,
    },
  };
}

export function applyAction(state: GameState, action: GameAction): GameState {
  const next: GameState = {
    ...state,
    board: state.board.map((row) => row.map((cell) => ({ ...cell, notes: { ...cell.notes } }))),
    hintState: { ...state.hintState },
  };

  // Undo/Redo without coordinates
  if (action.type === 'undo') {
    const prev = state.history.past[state.history.past.length - 1];
    if (!prev) return state;
    const newPast = state.history.past.slice(0, -1);
    const newFuture = [
      {
        board: state.board,
        livesRemaining: state.livesRemaining,
        hintsUsed: state.hintState.hintsUsed,
      },
      ...state.history.future,
    ];
    return {
      ...state,
      board: prev.board,
      // Lives must be unaffected by history actions per MVP
      livesRemaining: state.livesRemaining,
      // Hint state is unaffected by history actions per MVP
      hintState: state.hintState,
      history: { past: newPast, future: newFuture },
    };
  }
  if (action.type === 'redo') {
    const fut = state.history.future[0];
    if (!fut) return state;
    const newFuture = state.history.future.slice(1);
    const newPast = [
      ...state.history.past,
      {
        board: state.board,
        livesRemaining: state.livesRemaining,
        hintsUsed: state.hintState.hintsUsed,
      },
    ];
    return {
      ...state,
      board: fut.board,
      // Lives must be unaffected by history actions per MVP
      livesRemaining: state.livesRemaining,
      // Hint state is unaffected by history actions per MVP
      hintState: state.hintState,
      history: { past: newPast, future: newFuture },
    };
  }

  // Coord-based actions with proper narrowing
  switch (action.type) {
    case 'place': {
      next.history = {
        past: [
          ...state.history.past,
          {
            board: state.board,
            livesRemaining: state.livesRemaining,
            hintsUsed: state.hintState.hintsUsed,
          },
        ],
        future: [],
      };
      const cell = getCell(next.board, action.row, action.col);
      if (cell.isGiven) return next; // ignore edits to givens
      cell.notes = {};
      cell.isError = false;
      if (action.value == null) {
        cell.value = null;
        return next;
      }
      if (!isValidPlacement(next.board, action.row, action.col, action.value)) {
        cell.value = action.value;
        cell.isError = true;
        next.livesRemaining = Math.max(0, next.livesRemaining - 1);
        return next;
      }
      cell.value = action.value;
      return next;
    }
    case 'note': {
      next.history = {
        past: [
          ...state.history.past,
          {
            board: state.board,
            livesRemaining: state.livesRemaining,
            hintsUsed: state.hintState.hintsUsed,
          },
        ],
        future: [],
      };
      const cell = getCell(next.board, action.row, action.col);
      if (cell.isGiven) return next;
      if (cell.value) cell.value = null; // typing a note clears value
      if (action.present) {
        cell.notes[action.value] = true;
      } else {
        delete cell.notes[action.value];
      }
      return next;
    }
    case 'erase': {
      next.history = {
        past: [
          ...state.history.past,
          {
            board: state.board,
            livesRemaining: state.livesRemaining,
            hintsUsed: state.hintState.hintsUsed,
          },
        ],
        future: [],
      };
      const cell = getCell(next.board, action.row, action.col);
      if (cell.isGiven) return next;
      cell.value = null;
      cell.notes = {};
      cell.isError = false;
      return next;
    }
    case 'hint': {
      // Hint actions don't create history entries as they don't change the board state
      // They only affect the hint state
      if (action.hintType === 'direct' || action.hintType === 'logic') {
        next.hintState.hintsUsed += 1;
        next.hintState.hintsRemaining = Math.max(0, next.hintState.hintsRemaining - 1);
        next.hintState.lastHintType = action.hintType;
        next.hintState.lastHintTime = Date.now();
      }
      return next;
    }
    default:
      return next;
  }
}
