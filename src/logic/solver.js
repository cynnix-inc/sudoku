// Pure Sudoku grid logic (no DOM). ESM for browser and test-friendly usage.

export function createEmptyGrid() {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));
}

export function isValidMove(grid, row, col, num) {
  // row
  for (let x = 0; x < 9; x++) if (grid[row][x] === num) return false;
  // col
  for (let x = 0; x < 9; x++) if (grid[x][col] === num) return false;
  // box
  const sr = Math.floor(row / 3) * 3;
  const sc = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[sr + i][sc + j] === num) return false;
    }
  }
  return true;
}

function findEmptyCell(grid) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return [r, c];
    }
  }
  return null;
}

export function solveBoard(inputGrid) {
  const grid = inputGrid.map((row) => row.slice());
  const backtrack = () => {
    const empty = findEmptyCell(grid);
    if (!empty) return true;
    const [r, c] = empty;
    for (let n = 1; n <= 9; n++) {
      if (isValidMove(grid, r, c, n)) {
        grid[r][c] = n;
        if (backtrack()) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  };
  const solved = backtrack();
  return { solved, grid };
}

function fillBox(grid, row, col, rng = Math.random) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const idx = Math.floor(rng() * numbers.length);
      grid[row + i][col + j] = numbers[idx];
      numbers.splice(idx, 1);
    }
  }
}

export function generateSolvedBoard(rng = Math.random) {
  const grid = createEmptyGrid();
  fillBox(grid, 0, 0, rng);
  fillBox(grid, 3, 3, rng);
  fillBox(grid, 6, 6, rng);
  const { solved, grid: out } = solveBoard(grid);
  if (solved) return out;
  // Retry once with a fresh seed
  const grid2 = createEmptyGrid();
  fillBox(grid2, 0, 0, rng);
  fillBox(grid2, 3, 3, rng);
  fillBox(grid2, 6, 6, rng);
  const { solved: solved2, grid: out2 } = solveBoard(grid2);
  return solved2 ? out2 : out2; // return whatever the solver produced
}

// Expose globally for non-module consumers (script.js may consult window.SudokuSolver)
try {
  if (typeof window !== 'undefined') {
    window.SudokuSolver = { createEmptyGrid, isValidMove, solveBoard, generateSolvedBoard };
  }
} catch {}


