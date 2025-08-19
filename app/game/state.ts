import type { Board, Cell, Digit, GameAction, GameConfig, GameState } from "./types";

export function createEmptyBoard(): Board {
	const board: Board = [];
	for (let r = 0; r < 9; r++) {
		const row: Cell[] = [];
		for (let c = 0; c < 9; c++) {
			row.push({ row: r, col: c, value: null, notes: {}, isGiven: false });
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
	config: GameConfig
): GameState {
	const board = createEmptyBoard();
	for (const g of givens) {
		const cell = getCell(board, g.row, g.col);
		cell.value = g.value;
		cell.isGiven = true;
		cell.notes = {};
	}
	return {
		board,
		givens: [...givens],
		config,
		livesRemaining: config.maxLives,
	};
}

export function applyAction(state: GameState, action: GameAction): GameState {
	const next: GameState = {
		...state,
		board: state.board.map((row) => row.map((cell) => ({ ...cell, notes: { ...cell.notes } }))),
	};
	const cell = getCell(next.board, action.row, action.col);
	if (cell.isGiven) {
		return next; // ignore edits to givens
	}
	if (action.type === "place") {
		cell.value = action.value;
		cell.notes = {};
		return next;
	}
	if (action.type === "note") {
		if (cell.value) cell.value = null; // typing a note clears value
		if (action.present) {
			cell.notes[action.value] = true;
		} else {
			delete cell.notes[action.value];
		}
		return next;
	}
	if (action.type === "erase") {
		cell.value = null;
		cell.notes = {};
		return next;
	}
	return next;
}


