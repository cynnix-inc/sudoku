export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Cell = {
  row: number;
  col: number;
  value: Digit | null;
  isGiven: boolean;
  isError: boolean;
  notes: Partial<Record<Digit, boolean>>;
};

export type Board = Cell[][]; // 9x9 grid

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master' | 'extreme';

export type GameConfig = {
  difficulty: Difficulty;
  maxLives: number;
};

export type GameHistoryEntry = {
  board: Board;
  livesRemaining: number;
  hintsUsed: number;
};

export type HintState = {
  hintsUsed: number;
  hintsRemaining: number;
  lastHintType?: 'direct' | 'logic';
  lastHintTime?: number;
};

export type GameState = {
  board: Board;
  givens: { row: number; col: number; value: Digit }[];
  config: GameConfig;
  livesRemaining: number;
  history: { past: GameHistoryEntry[]; future: GameHistoryEntry[] };
  hintState: HintState;
};

export type GameAction =
  | { type: 'place'; row: number; col: number; value: Digit | null }
  | { type: 'note'; row: number; col: number; value: Digit; present: boolean }
  | { type: 'erase'; row: number; col: number }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'hint'; hintType: 'direct' | 'logic' };
