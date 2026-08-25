import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../runner/runner.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../runner/index.html', import.meta.url), 'utf8');

test('initializes Godot with the shared runtime base path', () => {
  assert.match(source, /const runtimeBase = new URL\('godot', runtimeRoot\)/);
  assert.match(source, /await engine\.init\(runtimeBase\);/);
});

test('hidden runner overlay is actually removed from layout', () => {
  assert.match(html, /#overlay\[hidden\]\s*\{\s*display:\s*none;?\s*\}/);
});
