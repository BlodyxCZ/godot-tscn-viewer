import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resourceDisplayName } from '../src/ui/resources.js';

const source = fs.readFileSync(new URL('../src/ui/resources.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('external resources use the file name as their primary label', () => {
  assert.equal(resourceDisplayName({
    kind: 'ext_resource',
    attributes: { id: '1_abcd', type: 'Script', path: 'res://addons/player/player.gd' },
  }), 'player.gd');
  assert.equal(resourceDisplayName({
    kind: 'ext_resource',
    attributes: { id: '2_abcd', type: 'Texture2D', path: 'res://ui/icons/item icon.png' },
  }), 'item icon.png');
});

test('embedded resources use their Godot type as their primary label', () => {
  assert.equal(resourceDisplayName({
    kind: 'sub_resource',
    attributes: { id: 'StyleBoxFlat_x8f31', type: 'StyleBoxFlat' },
  }), 'StyleBoxFlat');
  assert.equal(resourceDisplayName({
    kind: 'sub_resource',
    attributes: { id: 'RectangleShape2D_xyz', type: 'RectangleShape2D' },
  }), 'RectangleShape2D');
});

test('resources UI separates external and embedded resources and keeps raw ids secondary', () => {
  assert.match(source, /text: 'External'/);
  assert.match(source, /text: 'Embedded'/);
  assert.match(source, /className: 'resource-id'/);
  assert.match(source, /className: 'resource-type'/);
  assert.match(source, /className: 'resource-list'/);
  assert.doesNotMatch(source, /className: 'badge'/);
  assert.doesNotMatch(source, /className: 'resource-grid'/);
});

test('resource rows use a flat devtool-style layout', () => {
  assert.match(styles, /\.resource-list \{/);
  assert.match(styles, /\.resource-row \{/);
  assert.match(styles, /\.resource-name \{/);
  assert.match(styles, /\.resource-id \{[^}]*color:\s*var\(--muted\);/s);
  assert.match(styles, /\.resource-type \{[^}]*color:\s*var\(--muted\);/s);
});
