import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const treeSource = fs.readFileSync(new URL('../src/ui/tree.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('scene tree uses a compact devtool-style row contract', () => {
  assert.match(treeSource, /className: `tree-row\$\{depth === 0 \? ' root' : ''\}`/);
  assert.match(treeSource, /className: 'tree-chevron'/);
  assert.match(treeSource, /text: treeNode\.children\.length \? '⌄' : ''/);
  assert.match(treeSource, /className: 'node-instance'/);
  assert.doesNotMatch(treeSource, /node-icon/);
  assert.doesNotMatch(treeSource, /text: '◇'/);
  assert.doesNotMatch(treeSource, /className: 'badge', text: 'instance'/);
});

test('scene tree styling is flat, dense, and uses a left selection accent', () => {
  assert.match(styles, /\.tree-row \{[^}]*min-height:\s*28px;/s);
  assert.match(styles, /\.tree-row \{[^}]*border-radius:\s*0;/s);
  assert.match(styles, /\.tree-row\.selected \{[^}]*box-shadow:\s*inset 2px 0 var\(--accent\);/s);
  assert.match(styles, /\.tree-row\.root \{[^}]*font-weight:\s*600;/s);
  assert.match(styles, /\.node-instance \{[^}]*color:\s*var\(--muted\);/s);
  assert.match(styles, /\.tree-guide \{/);
});
