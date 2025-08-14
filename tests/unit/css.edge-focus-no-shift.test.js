const fs = require('fs');
const path = require('path');

describe('Edge focus stability CSS guards', () => {
  const read = (p) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

  test('board uses content-box width and fixed board-size token', () => {
    const css = read('src/ui/board.css');
    expect(css).toMatch(/\.board[\s\S]*?box-sizing:\s*content-box;/);
    expect(css).toMatch(/\.board[\s\S]*?width:\s*var\(--board-size\)/);
  });

  test('cell focus ring matches separator thickness; no outline', () => {
    const css = read('src/ui/board.css');
    expect(css).toMatch(/\.cell:focus[\s\S]*?box-shadow:\s*inset 0 0 0 var\(--sep-thickness\)/);
    expect(css).toMatch(/\.cell:focus-visible[\s\S]*?outline:\s*none/);
  });

  test('stable scrollbar gutter to prevent recentering', () => {
    const css = read('styles.css');
    expect(css).toMatch(/scrollbar-gutter:\s*stable/);
    expect(css).toMatch(/html\s*\{[\s\S]*?overflow-y:\s*scroll/);
  });
});


