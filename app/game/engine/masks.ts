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

export function generateMask(seed: string, targetClues: number, mode: SymMode): boolean[][] {
  const rng = createRng(hashStringToSeed(`${seed}#mask#${mode}#${targetClues}`));
  const mask: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));
  // Build list of canonical positions for pairing based on symmetry
  const coords: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const [sr, sc] = symmetricOf(mode, r, c);
      if (mode === 'none') {
        coords.push([r, c]);
      } else if (mode === 'rot180') {
        if (r < sr || (r === sr && c <= sc)) coords.push([r, c]);
      } else if (mode === 'mirrorH') {
        if (r <= sr) coords.push([r, c]);
      } else if (mode === 'mirrorV') {
        if (c <= sc) coords.push([r, c]);
      }
    }
  }
  const order = shuffled(coords, rng);
  let remaining = targetClues;
  for (const [r, c] of order) {
    if (remaining <= 0) break;
    const [sr, sc] = symmetricOf(mode, r, c);
    if (mask[r]![c] || mask[sr]![sc]) continue;
    if (r === sr && c === sc) {
      if (remaining >= 1) {
        mask[r]![c] = true;
        remaining -= 1;
      }
    } else {
      if (remaining >= 2) {
        mask[r]![c] = true;
        mask[sr]![sc] = true;
        remaining -= 2;
      }
    }
  }
  if (remaining > 0) {
    const flat: [number, number][] = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) flat.push([r, c]);
    for (const [r, c] of shuffled(flat, rng)) {
      if (!mask[r]![c]) {
        mask[r]![c] = true;
        remaining--;
        if (remaining <= 0) break;
      }
    }
  }
  return mask;
}

export function generateCuratedMask(seed: string, targetClues: number, mode: SymMode): boolean[][] {
  const rng = createRng(hashStringToSeed(`${seed}#curated#${mode}#${targetClues}`));
  const mask: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));
  // Select whole 3x3 boxes first
  const boxes = shuffled(
    Array.from({ length: 9 }, (_, i) => i),
    rng,
  );
  let remaining = targetClues;
  for (const b of boxes) {
    if (remaining < 9) break;
    const br = Math.floor(b / 3) * 3;
    const bc = (b % 3) * 3;
    for (let r = br; r < br + 3; r++) for (let c = bc; c < bc + 3; c++) mask[r]![c] = true;
    remaining -= 9;
  }
  if (remaining > 0) {
    // Fill remaining using symmetric pairs to keep structure
    const coords: [number, number][] = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) coords.push([r, c]);
    for (const [r, c] of shuffled(coords, rng)) {
      if (remaining <= 0) break;
      if (mask[r]![c]) continue;
      const [sr, sc] = symmetricOf(mode, r, c);
      if (r === sr && c === sc) {
        if (remaining >= 1) {
          mask[r]![c] = true;
          remaining -= 1;
        }
      } else {
        if (remaining >= 2 && !mask[sr]![sc]) {
          mask[r]![c] = true;
          mask[sr]![sc] = true;
          remaining -= 2;
        }
      }
    }
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