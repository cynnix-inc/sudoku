// Canonical game types live here. Files under app/game/* re-export from here.

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master' | 'extreme';

export type Cell = {
  row: number;
  col: number;
  value: Digit | null;
  notes: Partial<Record<Digit, true>>;
  isGiven: boolean;
  isError: boolean;
};

export type Board = Cell[][]; // 9x9 grid

export type GameConfig = {
  difficulty: Difficulty;
  maxLives: number;
};

export type GameHistorySnapshot = {
  board: Board;
  livesRemaining: number;
};

export type GameState = {
  board: Board;
  givens: { row: number; col: number; value: Digit }[];
  config: GameConfig;
  livesRemaining: number;
  history: { past: GameHistorySnapshot[]; future: GameHistorySnapshot[] };
};

export type GameAction =
  | { type: 'place'; row: number; col: number; value: Digit | null }
  | { type: 'note'; row: number; col: number; value: Digit; present: boolean }
  | { type: 'erase'; row: number; col: number }
  | { type: 'undo' }
  | { type: 'redo' };
