import type { Difficulty } from '../types';
import { DIFFICULTY_THRESHOLDS } from './difficulty';
import { createRng, hashStringToSeed, shuffled } from './random';

export type SymMode = 'rot180' | 'mirrorH' | 'mirrorV' | 'none';

export function getTierBounds(difficulty: Difficulty): { min: number; max: number } {
  const t = DIFFICULTY_THRESHOLDS[difficulty];
  return { min: t.minClues, max: t.maxClues };
}

export function pickTargetClues(seed: string, difficulty: Difficulty): number {
  const { min, max } = getTierBounds(difficulty);
  const rng = createRng(hashStringToSeed(`${seed}#target`));
  // Bias toward upper bound for uniqueness reliability but keep variability
  const span = Math.max(0, max - min);
  const offset = Math.floor(rng() * Math.min(3, span + 1));
  return Math.max(min, Math.min(max, max - offset));
}

function symmetricOf(mode: SymMode, r: number, c: number): [number, number] {
  switch (mode) {
    case 'rot180':
      return [8 - r, 8 - c];
    case 'mirrorH':
      return [8 - r, c];
    case 'mirrorV':
      return [r, 8 - c];
    case 'none':
    default:
      return [r, c];
  }
}

function representativeCoords(mode: SymMode): [number, number][] {
  const reps: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const [sr, sc] = symmetricOf(mode, r, c);
      if (mode === 'none') {
        reps.push([r, c]);
      } else if (mode === 'rot180') {
        if (r < sr || (r === sr && c <= sc)) reps.push([r, c]);
      } else if (mode === 'mirrorH') {
        if (r <= sr) reps.push([r, c]);
      } else if (mode === 'mirrorV') {
        if (c <= sc) reps.push([r, c]);
      }
    }
  }
  return reps;
}

function fillPairs(mask: boolean[][], targetClues: number, mode: SymMode, rng: () => number) {
  let remaining = Math.max(0, targetClues);
  const reps = representativeCoords(mode);
  const order = shuffled(reps, rng);
  for (const item of order) {
    if (!item || item.length < 2) continue;
    if (remaining <= 0) break;
    const r = item[0] as number;
    const c = item[1] as number;
    const [sr, sc] = symmetricOf(mode, r, c);
    const same = r === sr && c === sc;
    const need = same ? 1 : 2;
    if (remaining < need) continue;
    if (same) {
      if (!mask[r]![c]) {
        mask[r]![c] = true;
        remaining -= 1;
      }
    } else {
      if (!mask[r]![c] && !mask[sr]![sc]) {
        mask[r]![c] = true;
        mask[sr]![sc] = true;
        remaining -= 2;
      }
    }
  }
  // If still remaining, fill arbitrarily ignoring symmetry to hit exact target
  if (remaining > 0) {
    const all: [number, number][] = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) all.push([r, c]);
    for (const item of shuffled(all, rng)) {
      if (!item || item.length < 2) continue;
      if (remaining <= 0) break;
      const r = item[0] as number;
      const c = item[1] as number;
      if (!mask[r]![c]) {
        mask[r]![c] = true;
        remaining--;
      }
    }
  }
}

export function generateMask(seed: string, targetClues: number, mode: SymMode): boolean[][] {
  const rng = createRng(hashStringToSeed(`${seed}#mask#${mode}#${targetClues}`));
  const mask: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));
  fillPairs(mask, targetClues, mode, rng);
  return mask;
}

export function generateCuratedMask(seed: string, targetClues: number, mode: SymMode): boolean[][] {
  const rng = createRng(hashStringToSeed(`${seed}#curated#${mode}#${targetClues}`));
  const mask: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));
  let remaining = targetClues;
  // Select whole 3x3 boxes first when possible
  const boxes = shuffled(
    Array.from({ length: 9 }, (_, i) => i),
    rng,
  );
  for (const b of boxes) {
    if (remaining < 9) break;
    const br = Math.floor(b / 3) * 3;
    const bc = (b % 3) * 3;
    let filled = 0;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++) {
        if (!mask[r]![c]) {
          mask[r]![c] = true;
          filled++;
        }
      }
    remaining -= filled;
  }
  if (remaining > 0) {
    fillPairs(mask, remaining, mode, rng);
  }
  return mask;
}

export function* symmetryModes(seed: string): Generator<SymMode> {
  const modes: SymMode[] = ['rot180', 'mirrorH', 'mirrorV', 'none'];
  const rng = createRng(hashStringToSeed(`${seed}#modes`));
  const shuffledModes = modes.slice().sort(() => (rng() < 0.5 ? -1 : 1));
  let i = 0;
  while (true) {
    yield shuffledModes[i % shuffledModes.length] as SymMode;
    i++;
  }
}
