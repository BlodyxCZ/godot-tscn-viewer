import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/ui/play.js', import.meta.url), 'utf8');

test('Play toolbar exposes viewer and fullscreen sharing actions', () => {
  assert.match(source, /Copy viewer link/);
  assert.match(source, /Copy fullscreen link/);
  assert.match(source, /Open fullscreen/);
  assert.match(source, /viewerUrl\(target/);
  assert.match(source, /runnerUrl\(target, manifest/);
});

test('Play toolbar opens fullscreen in a separate tab', () => {
  assert.match(source, /window\.open\(fullscreenUrl, '_blank', 'noopener,noreferrer'\)/);
});
