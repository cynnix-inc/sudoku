import type { Board, Digit } from '../../game/types';
import { getCell } from '../../game/state';
import { isValidPlacement } from '../../game/rules';

export type Technique = 'nakedSingle' | 'hiddenSingle';

export type StrategyStep = {
  technique: Technique;
  row: number;
  col: number;
  value: Digit;
};

export function computeCandidates(board: Board, row: number, col: number): Digit[] {
  const cell = getCell(board, row, col);
  if (cell.value != null) return [];
  const candidates: Digit[] = [];
  for (let v = 1 as Digit; v <= 9; v = (v + 1) as Digit) {
    if (isValidPlacement(board, row, col, v)) candidates.push(v);
  }
  return candidates;
}

function findNakedSingle(board: Board): StrategyStep | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = getCell(board, r, c);
      if (cell.value != null) continue;
      const candidates = computeCandidates(board, r, c);
      if (candidates.length === 1) {
        return { technique: 'nakedSingle', row: r, col: c, value: candidates[0]! };
      }
    }
  }
  return null;
}

function unitCells(): [number, number][][] {
  const units: [number, number][][] = [];
  // Rows
  for (let r = 0; r < 9; r++) units.push(Array.from({ length: 9 }, (_, c) => [r, c]));
  // Cols
  for (let c = 0; c < 9; c++) units.push(Array.from({ length: 9 }, (_, r) => [r, c]));
  // Boxes
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const coords: [number, number][] = [];
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) coords.push([r, c]);
      }
      units.push(coords);
    }
  }
  return units;
}

function findHiddenSingle(board: Board): StrategyStep | null {
  const units = unitCells();
  for (const coords of units) {
    // For each digit, track candidate locations
    const locations: Record<Digit, [number, number][]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };
    for (const [r, c] of coords) {
      const cell = getCell(board, r, c);
      if (cell.value != null) continue;
      const cands = computeCandidates(board, r, c);
      for (const v of cands) locations[v].push([r, c]);
    }
    for (let v = 1 as Digit; v <= 9; v = (v + 1) as Digit) {
      const locs = locations[v];
      if (locs.length === 1) {
        const [r, c] = locs[0]!;
        return { technique: 'hiddenSingle', row: r, col: c, value: v };
      }
    }
  }
  return null;
}

export function findNextStep(board: Board): StrategyStep | null {
  return findNakedSingle(board) ?? findHiddenSingle(board);
}

export function applyStep(board: Board, step: StrategyStep): void {
  const cell = getCell(board, step.row, step.col);
  cell.value = step.value;
  cell.isError = false;
  cell.notes = {};
}

export function solveWithStrategies(
  input: Board,
  techniques: Technique[] = ['nakedSingle', 'hiddenSingle'],
  maxIterations = 1000,
): { solved: boolean; steps: StrategyStep[] } {
  const board: Board = input.map((row) =>
    row.map((cell) => ({ ...cell, notes: { ...cell.notes } })),
  );
  const steps: StrategyStep[] = [];
  let iter = 0;
  while (iter++ < maxIterations) {
    const step = findNextStep(board);
    if (!step || !techniques.includes(step.technique)) break;
    applyStep(board, step);
    steps.push(step);
    // Quick solved check: any null values remaining?
    let hasEmpty = false;
    for (let r = 0; r < 9 && !hasEmpty; r++) {
      for (let c = 0; c < 9; c++) {
        if (getCell(board, r, c).value == null) {
          hasEmpty = true;
          break;
        }
      }
    }
    if (!hasEmpty) return { solved: true, steps };
  }
  return { solved: false, steps };
}
