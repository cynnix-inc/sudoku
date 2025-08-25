import type { Digit } from '../types';

export type Grid = (Digit | null)[][]; // 9x9 values grid

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice()) as Grid;
}

function isValid(grid: Grid, row: number, col: number, value: Digit): boolean {
  for (let c = 0; c < 9; c++) if (c !== col && (grid[row]![c] ?? null) === value) return false;
  for (let r = 0; r < 9; r++) if (r !== row && (grid[r]![col] ?? null) === value) return false;
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (!(r === row && c === col) && (grid[r]![c] ?? null) === value) return false;
    }
  }
  return true;
}

function findEmpty(grid: Grid): [number, number] | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if ((grid[r]![c] ?? null) == null) return [r, c];
    }
  }
  return null;
}

export function solveGrid(grid: Grid): boolean {
  const empty = findEmpty(grid);
  if (!empty) return true;
  const [row, col] = empty;
  for (let v = 1 as Digit; v <= 9; v = (v + 1) as Digit) {
    if (isValid(grid, row, col, v)) {
      grid[row]![col] = v;
      if (solveGrid(grid)) return true;
      grid[row]![col] = null;
    }
  }
  return false;
}

export function countSolutions(grid: Grid, cap = 2): number {
  let solutions = 0;
  function backtrack(): boolean {
    const empty = findEmpty(grid);
    if (!empty) {
      solutions++;
      return solutions >= cap; // early exit when reaching cap
    }
    const [row, col] = empty;
    for (let v = 1 as Digit; v <= 9; v = (v + 1) as Digit) {
      if (isValid(grid, row, col, v)) {
        grid[row]![col] = v;
        if (backtrack()) return true;
        grid[row]![col] = null;
      }
    }
    return false;
  }
  backtrack();
  return solutions;
}
