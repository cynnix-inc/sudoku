import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

type Row = {
  number: number;
  title: string;
  url: string;
  parent?: number | null;
  parentState?: string | null;
  is_orphan: boolean;
};

function runScriptLocal(): Row[] {
  const script = join(process.cwd(), 'scripts', 'find-orphans.ps1');
  const output = execFileSync(
    'pwsh',
    ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-UseLocal'],
    { encoding: 'utf8' },
  );
  const lines = output.trim();
  const jsonStart = lines.indexOf('[');
  const json = jsonStart >= 0 ? lines.slice(jsonStart) : lines;
  return JSON.parse(json) as Row[];
}

describe('find-orphans.ps1 (local mode)', () => {
  it('produces rows with parentState and is_orphan flags', () => {
    const rows = runScriptLocal();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);

    for (const r of rows) {
      expect(r).toHaveProperty('number');
      expect(r).toHaveProperty('title');
      expect(r).toHaveProperty('url');
      expect(r).toHaveProperty('parent');
      expect(r).toHaveProperty('parentState');
      expect(r).toHaveProperty('is_orphan');
    }

    // Spot-check: known orphans from local fixtures (parentState closed => is_orphan true)
    const sample = rows.find((r) => r.number === 396);
    if (sample) {
      expect(sample.parentState).toBe('closed');
      expect(sample.is_orphan).toBe(true);
    }
  });
});
