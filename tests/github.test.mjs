import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseGitHubBlobUrl,
  parseViewerQuery,
  rawContentUrl,
  githubBlobUrl,
  resolveResPath,
} from '../src/github.js';

test('parses a GitHub TSCN blob URL', () => {
  assert.deepEqual(
    parseGitHubBlobUrl('https://github.com/acme/game/blob/main/scenes/ui.tscn'),
    { owner: 'acme', repo: 'game', ref: 'main', path: 'scenes/ui.tscn' },
  );
});

test('rejects unsupported hosts and non-tscn paths', () => {
  assert.throws(() => parseGitHubBlobUrl('https://example.com/acme/game/blob/main/ui.tscn'), /github\.com/);
  assert.throws(() => parseGitHubBlobUrl('https://github.com/acme/game/blob/main/README.md'), /\.tscn/);
});

test('parses viewer query in url mode and canonical mode', () => {
  assert.deepEqual(
    parseViewerQuery('?url=https%3A%2F%2Fgithub.com%2Facme%2Fgame%2Fblob%2Fmain%2Fscenes%2Fui.tscn'),
    { owner: 'acme', repo: 'game', ref: 'main', path: 'scenes/ui.tscn' },
  );
  assert.deepEqual(
    parseViewerQuery('?repo=acme%2Fgame&ref=dev&path=scenes%2Fui.tscn'),
    { owner: 'acme', repo: 'game', ref: 'dev', path: 'scenes/ui.tscn' },
  );
});

test('builds raw and GitHub blob URLs safely', () => {
  const target = { owner: 'acme', repo: 'game', ref: 'feature/test', path: 'scenes/ui test.tscn' };
  assert.equal(
    rawContentUrl(target),
    'https://raw.githubusercontent.com/acme/game/feature%2Ftest/scenes/ui%20test.tscn',
  );
  assert.equal(
    githubBlobUrl(target),
    'https://github.com/acme/game/blob/feature%2Ftest/scenes/ui%20test.tscn',
  );
});

test('resolves res paths back to GitHub blobs', () => {
  const target = { owner: 'acme', repo: 'game', ref: 'main', path: 'scenes/ui.tscn' };
  assert.equal(
    resolveResPath(target, 'res://scripts/ui.gd'),
    'https://github.com/acme/game/blob/main/scripts/ui.gd',
  );
  assert.equal(resolveResPath(target, 'https://evil.example/x'), null);
});
