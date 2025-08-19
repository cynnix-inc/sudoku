export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CellValue = Digit | null;

export type CellNotes = Partial<Record<Digit, true>>;

export type Cell = {
	row: number; // 0..8
	col: number; // 0..8
	value: CellValue;
	notes: CellNotes;
	isGiven: boolean;
};

export type Board = Cell[][]; // 9x9 grid

export type Difficulty = "easy" | "medium" | "hard";

export type GameConfig = {
	difficulty: Difficulty;
	maxLives: number; // for classic mistakes
};

export type GameState = {
	board: Board;
	givens: { row: number; col: number; value: Digit }[];
	config: GameConfig;
	livesRemaining: number;
};

export type PlaceAction = { type: "place"; row: number; col: number; value: Digit | null };
export type NoteAction = { type: "note"; row: number; col: number; value: Digit; present: boolean };
export type EraseAction = { type: "erase"; row: number; col: number };

export type GameAction = PlaceAction | NoteAction | EraseAction;


