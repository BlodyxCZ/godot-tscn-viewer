import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('index exposes the stable viewer DOM contract', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['scene-tree', 'inspector', 'play-view', 'resources-view', 'connections-view', 'source-view', 'open-form']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.equal((html.match(/data-tab=/g) ?? []).length, 5);
  assert.match(html, /data-tab="play"/);
});
