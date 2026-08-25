import test from 'node:test';
import assert from 'node:assert/strict';
import {
  previewManifestApiUrl,
  previewPackApiUrl,
  validatePreviewManifest,
  runnerUrl,
} from '../src/play/preview.js';

const target = { owner: 'Foo', repo: 'Game', ref: 'main', path: 'scenes/shop.tscn' };

test('builds GitHub contents API URL for preview manifest', () => {
  assert.equal(
    previewManifestApiUrl(target),
    'https://api.github.com/repos/Foo/Game/contents/preview.json?ref=tscn-preview',
  );
});

test('builds GitHub contents API URL for preview pack', () => {
  assert.equal(
    previewPackApiUrl(target, 'preview.pck'),
    'https://api.github.com/repos/Foo/Game/contents/preview.pck?ref=tscn-preview',
  );
});

test('accepts compatible manifest', () => {
  assert.deepEqual(validatePreviewManifest({
    schema_version: 1,
    godot_version: '4.7',
    source_sha: 'abc',
    pack_path: 'preview.pck',
    generated_at: '2026-08-25T00:00:00Z',
  }), {
    schema_version: 1,
    godot_version: '4.7',
    source_sha: 'abc',
    pack_path: 'preview.pck',
    generated_at: '2026-08-25T00:00:00Z',
  });
});

test('rejects unsafe pack paths and incompatible schemas', () => {
  assert.throws(() => validatePreviewManifest({ schema_version: 2, godot_version: '4.7', pack_path: 'preview.pck' }), /schema/);
  assert.throws(() => validatePreviewManifest({ schema_version: 1, godot_version: '4.7', pack_path: '../evil.pck' }), /pack path/);
});

test('runner URL carries only repository and scene identity', () => {
  const url = new URL(runnerUrl(target, { godot_version: '4.7', pack_path: 'preview.pck' }, 'https://example.test/viewer/'));
  assert.equal(url.pathname, '/viewer/runner/');
  assert.equal(url.searchParams.get('owner'), 'Foo');
  assert.equal(url.searchParams.get('repo'), 'Game');
  assert.equal(url.searchParams.get('scene'), 'res://scenes/shop.tscn');
  assert.equal(url.searchParams.get('godot'), '4.7');
  assert.equal(url.searchParams.get('pack'), 'preview.pck');
});
