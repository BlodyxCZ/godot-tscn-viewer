import test from 'node:test';
import assert from 'node:assert/strict';
import {
  previewManifestApiUrl,
  previewPackApiUrl,
  validatePreviewManifest,
  runtimeVersionForGodot,
  viewerUrl,
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

test('accepts every supported Godot 4.x preview line', () => {
  for (let minor = 0; minor <= 8; minor += 1) {
    const godotVersion = `4.${minor}`;
    const manifest = validatePreviewManifest({
      schema_version: 1,
      godot_version: godotVersion,
      source_sha: 'abc',
      pack_path: 'preview.pck',
      generated_at: '2026-08-25T00:00:00Z',
    });
    assert.equal(manifest.godot_version, godotVersion);
  }
});

test('rejects unsupported Godot preview lines', () => {
  for (const godotVersion of ['3.6', '4.9', '5.0', 'banana']) {
    assert.throws(
      () => validatePreviewManifest({ schema_version: 1, godot_version: godotVersion, pack_path: 'preview.pck' }),
      /Godot preview version/,
    );
  }
});

test('maps legacy Godot 4.0-4.2 packs to the sandbox-safe 4.3 Web runtime', () => {
  assert.equal(runtimeVersionForGodot('4.0'), '4.3');
  assert.equal(runtimeVersionForGodot('4.1'), '4.3');
  assert.equal(runtimeVersionForGodot('4.2'), '4.3');
  for (const version of ['4.3', '4.4', '4.5', '4.6', '4.7', '4.8']) {
    assert.equal(runtimeVersionForGodot(version), version);
  }
});

test('rejects unsafe pack paths and incompatible schemas', () => {
  assert.throws(() => validatePreviewManifest({ schema_version: 2, godot_version: '4.7', pack_path: 'preview.pck' }), /schema/);
  assert.throws(() => validatePreviewManifest({ schema_version: 1, godot_version: '4.7', pack_path: '../evil.pck' }), /pack path/);
});

test('viewer URL carries canonical repository, ref, and scene path', () => {
  const url = new URL(viewerUrl(target, 'https://example.test/viewer/?stale=yes#old'));
  assert.equal(url.pathname, '/viewer/');
  assert.equal(url.searchParams.get('repo'), 'Foo/Game');
  assert.equal(url.searchParams.get('ref'), 'main');
  assert.equal(url.searchParams.get('path'), 'scenes/shop.tscn');
  assert.equal(url.searchParams.has('stale'), false);
  assert.equal(url.hash, '');
});

test('runner URL carries project version and resolved Web runtime separately', () => {
  const legacyUrl = new URL(runnerUrl(target, { godot_version: '4.2', pack_path: 'preview.pck' }, 'https://example.test/viewer/'));
  assert.equal(legacyUrl.pathname, '/viewer/runner/');
  assert.equal(legacyUrl.searchParams.get('owner'), 'Foo');
  assert.equal(legacyUrl.searchParams.get('repo'), 'Game');
  assert.equal(legacyUrl.searchParams.get('scene'), 'res://scenes/shop.tscn');
  assert.equal(legacyUrl.searchParams.get('godot'), '4.2');
  assert.equal(legacyUrl.searchParams.get('runtime'), '4.3');
  assert.equal(legacyUrl.searchParams.get('pack'), 'preview.pck');

  const currentUrl = new URL(runnerUrl(target, { godot_version: '4.8', pack_path: 'preview.pck' }, 'https://example.test/viewer/'));
  assert.equal(currentUrl.searchParams.get('runtime'), '4.8');
});
