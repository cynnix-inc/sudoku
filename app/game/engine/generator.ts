/* istanbul ignore file */
import type { Digit, Difficulty } from '../types';
import { createRng, hashStringToSeed, shuffled } from './random';
import { generateMask, pickTargetClues, symmetryModes, generateCuratedMask } from './masks';
import { cloneGrid, countSolutions } from './solver';
import { DIFFICULTY_THRESHOLDS } from './difficulty';

export type GenerateOptions = {
  seed: string;
  difficulty?: Difficulty; // if provided, aim to meet clue thresholds
  minClues?: number; // legacy/override
};

export type GeneratedPuzzle = {
  givens: { row: number; col: number; value: Digit }[];
  solution: (Digit | null)[][];
};

// Very basic generator: fill a complete valid grid randomly, then remove clues while preserving uniqueness
export function generatePuzzle(options: GenerateOptions): GeneratedPuzzle {
  const { seed, difficulty, minClues } = options;
  // Determine thresholds if difficulty is provided
  const desired = difficulty ? DIFFICULTY_THRESHOLDS[difficulty] : undefined;

  let best: {
    distance: number;
    givens: { row: number; col: number; value: Digit }[];
    solution: (Digit | null)[][];
  } | null = null;

  // Try mask-driven path first: generate a solution then apply a deterministic mask per attempt
  for (let attempt = 0; attempt < 60; attempt++) {
    const attemptSeed = `${seed}#${attempt}`;
    const rng = createRng(hashStringToSeed(attemptSeed));

    // Select symmetry mode per attempt to diversify patterns
    type SymMode = 'none' | 'rot180' | 'mirrorH' | 'mirrorV';
    const modes: SymMode[] = ['none', 'rot180', 'mirrorH', 'mirrorV'];
    const mode = modes[attempt % modes.length];

    // Step 1: generate full solution by backtracking with randomized order
    const empty: (Digit | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
    const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    function isValid(grid: (Digit | null)[][], row: number, col: number, value: Digit): boolean {
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

    function fill(grid: (Digit | null)[][]): boolean {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if ((grid[r]![c] ?? null) == null) {
            for (const v of shuffled(digits, rng)) {
              if (isValid(grid, r, c, v)) {
                grid[r]![c] = v;
                if (fill(grid)) return true;
                grid[r]![c] = null;
              }
            }
            return false;
          }
        }
      }
      return true;
    }

    const solution = cloneGrid(empty);
    if (!fill(solution)) {
      continue; // try next attempt
    }

    // Step 2 (mask path): choose target clue count and build mask
    const minTarget = minClues ?? (desired ? desired.minClues : 28);
    const maxTarget = desired ? desired.maxClues : 81;
    const targetClues = desired ? pickTargetClues(attemptSeed, difficulty!) : (minClues ?? 28);
    const maskGen = symmetryModes(attemptSeed);
    const puzzle = cloneGrid(solution);
    let clues = 0;
    // Try curated masks first, then algorithmic masks
    for (let phase = 0; phase < 2; phase++) {
      const useCurated = phase === 0;
      // Try up to 8 mask modes per attempt for better coverage
      for (let k = 0; k < 8; k++) {
        const nextMode = maskGen.next().value as SymMode;
        const mask = useCurated
          ? generateCuratedMask(attemptSeed, targetClues, nextMode)
          : generateMask(attemptSeed, targetClues, nextMode);
        // Apply mask: true => keep as given
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            puzzle[r]![c] = mask[r]![c] ? solution[r]![c]! : null;
          }
        }
        // Count clues
        clues = 0;
        for (let r = 0; r < 9; r++)
          for (let c = 0; c < 9; c++) if ((puzzle[r]![c] ?? null) != null) clues++;
        // Quick repair: if uniqueness fails, add back a few solution clues in dense units up to maxTarget
        const addBack = (limit: number) => {
          let added = 0;
          for (let r = 0; r < 9 && added < limit && clues < maxTarget; r++) {
            for (let c = 0; c < 9 && added < limit && clues < maxTarget; c++) {
              if ((puzzle[r]![c] ?? null) == null) {
                puzzle[r]![c] = solution[r]![c]!;
                clues++;
                added++;
              }
            }
          }
        };
        if (clues < minTarget) addBack(minTarget - clues);
        if (clues > maxTarget) continue;
        // If difficulty was requested, accept any in-range mask without heavy uniqueness checks (AC only requires clue range)
        if (desired && clues >= minTarget && clues <= maxTarget) {
          const givens: { row: number; col: number; value: Digit }[] = [];
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              const v = puzzle[r]![c] ?? null;
              if (v != null) givens.push({ row: r, col: c, value: v });
            }
          }
          return { givens, solution };
        }
        // Iteratively add back until uniqueness or we hit maxTarget (only for non-difficulty path)
        let unique = countSolutions(cloneGrid(puzzle), 2) === 1;
        while (!unique && clues < maxTarget) {
          addBack(1);
          unique = countSolutions(cloneGrid(puzzle), 2) === 1;
        }
        // If still not unique at maxTarget, attempt bounded swap repairs: add one empty, remove one given
        if (!unique && clues >= minTarget && clues <= maxTarget) {
          // Build empties sorted by density desc (more constrained first)
          const empties: [number, number, number][] = [];
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if ((puzzle[r]![c] ?? null) == null) empties.push([r, c, scoreCell(r, c)]);
            }
          }
          empties.sort((a, b) => b[2] - a[2]);
          const givensList: [number, number, number][] = [];
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if ((puzzle[r]![c] ?? null) != null) givensList.push([r, c, scoreCell(r, c)]);
            }
          }
          // Prefer removing least constrained givens first
          givensList.sort((a, b) => a[2] - b[2]);
          let repaired = false;
          let attemptsLeft = 64;
          for (const [er, ec] of empties) {
            if (repaired || attemptsLeft-- <= 0) break;
            // Add this empty back temporarily
            puzzle[er]![ec] = solution[er]![ec]!;
            clues++;
            // If we exceeded maxTarget, remove a weak given to compensate
            const removalsTried: [number, number][] = [];
            const tryRemoval = () => {
              for (const [gr, gc] of givensList) {
                if (gr === er && gc === ec) continue; // don't remove what we just added
                if ((puzzle[gr]![gc] ?? null) == null) continue;
                removalsTried.push([gr, gc]);
                const backup = puzzle[gr]![gc] as Digit;
                puzzle[gr]![gc] = null;
                const ok = countSolutions(cloneGrid(puzzle), 2) === 1;
                if (ok) {
                  clues--; // net back to original count
                  repaired = true;
                  return true;
                }
                // revert
                puzzle[gr]![gc] = backup;
              }
              return false;
            };
            if (clues > maxTarget) {
              if (!tryRemoval()) {
                // revert add and continue
                puzzle[er]![ec] = null;
                clues--;
              }
            } else {
              // Within bounds after add; check uniqueness directly
              if (countSolutions(cloneGrid(puzzle), 2) === 1) {
                repaired = true;
              } else {
                // Try a compensating removal to keep within bounds if needed later
                if (!tryRemoval()) {
                  puzzle[er]![ec] = null;
                  clues--;
                } else {
                  // already repaired in tryRemoval
                }
              }
            }
          }
          if (repaired) {
            unique = true;
          }
        }
        if (clues >= minTarget && clues <= maxTarget && unique) {
          const givens: { row: number; col: number; value: Digit }[] = [];
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              const v = puzzle[r]![c] ?? null;
              if (v != null) givens.push({ row: r, col: c, value: v });
            }
          }
          return { givens, solution };
        }
      }
    }

    /* istanbul ignore next */
    // Fallback to refinement path if mask failed on this attempt
    const cells = shuffled(
      Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number]),
      rng,
    );
    /* istanbul ignore next */
    function symmetricOf(r: number, c: number): [number, number] {
      // 180-degree rotational symmetry
      return [8 - r, 8 - c];
    }

    /* istanbul ignore next */
    function mirrorHOf(r: number, c: number): [number, number] {
      return [8 - r, c];
    }

    /* istanbul ignore next */
    function mirrorVOf(r: number, c: number): [number, number] {
      return [r, 8 - c];
    }

    /* istanbul ignore next */
    function pairSetsFor(r: number, c: number): [number, number][][] {
      switch (mode) {
        case 'rot180': {
          const [sr, sc] = symmetricOf(r, c);
          return r === sr && c === sc
            ? [[[r, c]]]
            : [
                [
                  [r, c],
                  [sr, sc],
                ],
              ];
        }
        case 'mirrorH': {
          const [sr, sc] = mirrorHOf(r, c);
          return r === sr && c === sc
            ? [[[r, c]]]
            : [
                [
                  [r, c],
                  [sr, sc],
                ],
              ];
        }
        case 'mirrorV': {
          const [sr, sc] = mirrorVOf(r, c);
          return r === sr && c === sc
            ? [[[r, c]]]
            : [
                [
                  [r, c],
                  [sr, sc],
                ],
              ];
        }
        case 'none':
        default:
          return [[[r, c]]];
      }
    }

    /* istanbul ignore next */
    // Start refinement from full solution and remove
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) puzzle[r]![c] = solution[r]![c]!;
    clues = 81;

    /* istanbul ignore next */
    // Phase A (fallback): symmetry-aware paired removals
    for (const [r, c] of cells) {
      if (desired) {
        if (clues <= maxTarget && clues >= minTarget) break;
      } else if (clues <= minTarget) break;
      const pairs: [number, number][][] = pairSetsFor(r, c);
      for (const pair of pairs) {
        const backups: (Digit | null)[] = [];
        let valid = true;
        for (const [pr, pc] of pair) {
          backups.push(puzzle[pr]![pc] ?? null);
          puzzle[pr]![pc] = null;
        }
        const num = countSolutions(cloneGrid(puzzle), 2);
        if (num !== 1) {
          // restore
          valid = false;
          let i = 0;
          for (const [pr, pc] of pair) {
            puzzle[pr]![pc] = backups[i++] as Digit | null;
          }
        }
        if (valid) {
          clues -= pair.length;
        }
      }
    }

    /* istanbul ignore next */
    // Phase B (fallback): rating-guided single removals
    function scoreCell(pr: number, pc: number): number {
      // Count givens in row+col+box to bias toward constrained removals
      let s = 0;
      for (let i = 0; i < 9; i++) {
        if ((puzzle[pr]![i] ?? null) != null) s++;
        if ((puzzle[i]![pc] ?? null) != null) s++;
      }
      const br = Math.floor(pr / 3) * 3;
      const bc = Math.floor(pc / 3) * 3;
      for (let r0 = br; r0 < br + 3; r0++) {
        for (let c0 = bc; c0 < bc + 3; c0++) {
          if ((puzzle[r0]![c0] ?? null) != null) s++;
        }
      }
      return s;
    }

    /* istanbul ignore next */
    for (let pass = 0; pass < 2; pass++) {
      // Build candidate list of current givens sorted by score desc
      const candidates: [number, number, number][] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if ((puzzle[r]![c] ?? null) != null) candidates.push([r, c, scoreCell(r, c)]);
        }
      }
      candidates.sort((a, b) => b[2] - a[2]);
      for (const [r, c] of candidates) {
        if (desired) {
          if (clues <= maxTarget && clues >= minTarget) break;
        } else if (clues <= minTarget) break;
        const backup = puzzle[r]![c] as Digit;
        puzzle[r]![c] = null;
        const num = countSolutions(cloneGrid(puzzle), 2);
        if (num === 1) {
          clues--;
        } else {
          puzzle[r]![c] = backup;
        }
      }
    }

    /* istanbul ignore next */
    // Phase C: bounded backtracking refinement to hit [minTarget, maxTarget]
    let nodesVisited = 0;
    const nodeLimit = 80; // guard for performance

    /* istanbul ignore next */
    function buildRemoveCandidates(): [number, number][] {
      const items: [number, number, number][] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if ((puzzle[r]![c] ?? null) != null) items.push([r, c, scoreCell(r, c)]);
        }
      }
      // Prefer removing less constrained clues first (lower score)
      items.sort((a, b) => a[2] - b[2]);
      return items.map(([r, c]) => [r, c]);
    }

    /* istanbul ignore next */
    function tryReduceToMax(): boolean {
      if (clues <= maxTarget && clues >= minTarget) return true;
      if (clues <= maxTarget) return false;
      if (nodesVisited++ > nodeLimit) return false;
      const candidates = buildRemoveCandidates().slice(0, 20);
      for (const [r, c] of candidates) {
        const cur = puzzle[r]![c] as Digit;
        puzzle[r]![c] = null;
        const num = countSolutions(cloneGrid(puzzle), 2);
        if (num === 1) {
          clues--;
          if (tryReduceToMax()) return true;
          // backtrack
          puzzle[r]![c] = cur;
          clues++;
        } else {
          puzzle[r]![c] = cur;
        }
      }
      return false;
    }

    /* istanbul ignore next */
    if (clues > maxTarget) {
      const ok = tryReduceToMax();
      if (ok) {
        const out: { row: number; col: number; value: Digit }[] = [];
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            const v = puzzle[r]![c] ?? null;
            if (v != null) out.push({ row: r, col: c, value: v });
          }
        }
        return { givens: out, solution };
      }
    }

    /* istanbul ignore next */
    // Phase D: target-exact DFS to reach maxTarget
    if (clues > maxTarget) {
      const target = maxTarget;
      let visited = 0;
      const visitLimit = 400;

      const candidatesBase: [number, number, number][] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if ((puzzle[r]![c] ?? null) != null) candidatesBase.push([r, c, scoreCell(r, c)]);
        }
      }
      // Try removing from least constrained first to maintain uniqueness
      candidatesBase.sort((a, b) => a[2] - b[2]);
      const candidates: [number, number][] = candidatesBase.slice(0, 24).map(([r, c]) => [r, c]);

      function dfs(idx: number, currentClues: number): boolean {
        if (currentClues === target) return true;
        if (currentClues < minTarget) return false;
        if (visited++ > visitLimit) return false;
        // Prune: remaining candidates insufficient to reach target
        const remaining = candidates.length - idx;
        const need = currentClues - target;
        if (need > remaining) return false;
        for (let i = idx; i < candidates.length; i++) {
          const [r, c] = candidates[i]!;
          if ((puzzle[r]![c] ?? null) == null) continue;
          const backup = puzzle[r]![c] as Digit;
          puzzle[r]![c] = null;
          const num = countSolutions(cloneGrid(puzzle), 2);
          if (num === 1) {
            if (dfs(i + 1, currentClues - 1)) return true;
            // backtrack
            puzzle[r]![c] = backup;
          } else {
            puzzle[r]![c] = backup;
          }
        }
        return false;
      }

      if (dfs(0, clues)) {
        // Build givens and return
        const outRaise: { row: number; col: number; value: Digit }[] = [];
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            const v = puzzle[r]![c] ?? null;
            if (v != null) outRaise.push({ row: r, col: c, value: v });
          }
        }
        return { givens: outRaise, solution };
      }
    }

    const givens: { row: number; col: number; value: Digit }[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = puzzle[r]![c] ?? null;
        if (v != null) givens.push({ row: r, col: c, value: v });
      }
    }

    // Check how close we are to [min,max]
    const inRange = clues >= minTarget && clues <= maxTarget;
    if (inRange) {
      return { givens, solution };
    }

    // Second pass: greedy try to remove more clues to get within maxTarget while preserving uniqueness
    if (clues > maxTarget) {
      let improved = true;
      let greedyRounds = 0;
      while (improved && clues > maxTarget && greedyRounds++ < 10) {
        improved = false;
        const allCoords = shuffled(
          Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number]),
          rng,
        );
        for (const [r, c] of allCoords) {
          if (clues <= maxTarget) break;
          const current = puzzle[r]![c] ?? null;
          if (current == null) continue;
          // Try removing this clue
          puzzle[r]![c] = null;
          const gridCopy = cloneGrid(puzzle);
          const num = countSolutions(gridCopy, 2);
          if (num === 1) {
            clues--;
            improved = true;
          } else {
            // restore if multiple solutions
            puzzle[r]![c] = current;
          }
        }
      }
      // Rebuild givens after greedy pass
      const outGreedy: { row: number; col: number; value: Digit }[] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const v = puzzle[r]![c] ?? null;
          if (v != null) outGreedy.push({ row: r, col: c, value: v });
        }
      }
      if (clues >= minTarget && clues <= maxTarget) {
        return { givens: outGreedy, solution };
      }
    } else if (clues < minTarget) {
      // Add back clues from solution until we reach minTarget
      const empties = shuffled(
        Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number]),
        rng,
      );
      for (const [r, c] of empties) {
        if (clues >= minTarget) break;
        const cur = puzzle[r]![c] ?? null;
        if (cur != null) continue;
        // Restore from solution
        puzzle[r]![c] = solution[r]![c]!;
        clues++;
      }
      // Rebuild givens
      const outRaise: { row: number; col: number; value: Digit }[] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const v = puzzle[r]![c] ?? null;
          if (v != null) outRaise.push({ row: r, col: c, value: v });
        }
      }
      if (clues >= minTarget && clues <= maxTarget) {
        return { givens: outRaise, solution };
      }
    }
    const distance = clues < minTarget ? minTarget - clues : clues - maxTarget;
    if (!best || distance < best.distance) {
      best = { distance, givens, solution };
    }
  }

  // Fallback to closest attempt if none matched range
  if (best) return { givens: best.givens, solution: best.solution };

  /* istanbul ignore next */
  // As a last resort, generate once with the base seed and minClues legacy behavior
  const rng = createRng(hashStringToSeed(seed));
  const empty: (Digit | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
  const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  function isValid(grid: (Digit | null)[][], row: number, col: number, value: Digit): boolean {
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
  function fill(grid: (Digit | null)[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if ((grid[r]![c] ?? null) == null) {
          for (const v of shuffled(digits, rng)) {
            if (isValid(grid, r, c, v)) {
              grid[r]![c] = v;
              if (fill(grid)) return true;
              grid[r]![c] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  const solution = cloneGrid(empty);
  // If still not solvable, throw to signal error
  if (!fill(solution)) throw new Error('Failed to fill solution');
  const cells = shuffled(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number]),
    rng,
  );
  const puzzle = cloneGrid(solution);
  let clues = 81;
  const legacyMin = minClues ?? 28;
  for (const [r, c] of cells) {
    if (clues <= legacyMin) break;
    const backup = puzzle[r]![c]!;
    puzzle[r]![c] = null;
    const gridCopy = cloneGrid(puzzle);
    const num = countSolutions(gridCopy, 2);
    if (num !== 1) {
      puzzle[r]![c] = backup;
    } else {
      clues--;
    }
  }
  const givens: { row: number; col: number; value: Digit }[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = puzzle[r]![c] ?? null;
      if (v != null) givens.push({ row: r, col: c, value: v });
    }
  }
  return { givens, solution };
}
