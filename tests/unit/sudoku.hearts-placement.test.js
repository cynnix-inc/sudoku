const fs = require('fs');
const path = require('path');

describe('UI – hearts placement', () => {
  test('health bar is rendered under the left controls column, not the center', () => {
    const htmlPath = path.resolve(__dirname, '../../index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    const parser = new window.DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const leftCol = doc.querySelector('.controls-left');
    const centerCol = doc.querySelector('.controls-center');

    expect(leftCol).not.toBeNull();
    expect(centerCol).not.toBeNull();

    // Hearts must be in the left column wrapper
    expect(leftCol.querySelector('.hearts-row #health-bar')).not.toBeNull();
    // And must not exist in the center column
    expect(centerCol.querySelector('#health-bar')).toBeNull();
  });
});


