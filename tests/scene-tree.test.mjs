import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSceneTree } from '../src/model/scene-tree.js';

function node(name, parent) {
  return { attributes: { name, ...(parent === undefined ? {} : { parent }) }, properties: [] };
}

test('resolves root-relative parent paths', () => {
  const tree = buildSceneTree([node('Root'), node('A', '.'), node('B', 'A'), node('C', 'A/B')]);
  assert.equal(tree.root.declaration.attributes.name, 'Root');
  assert.equal(tree.byPath.get('A/B').declaration.attributes.name, 'B');
  assert.equal(tree.byPath.get('A/B/C').declaration.attributes.name, 'C');
  assert.equal(tree.root.children[0].children[0].children[0].declaration.attributes.name, 'C');
});

test('keeps unresolved nodes instead of discarding them', () => {
  const tree = buildSceneTree([node('Root'), node('Lost', 'Missing')]);
  assert.equal(tree.unresolved.length, 1);
  assert.equal(tree.unresolved[0].declaration.attributes.name, 'Lost');
});

test('returns an empty structure for scenes without nodes', () => {
  const tree = buildSceneTree([]);
  assert.equal(tree.root, null);
  assert.equal(tree.byPath.size, 0);
});
