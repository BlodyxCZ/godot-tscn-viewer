import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTscn } from '../src/tscn/parser.js';
import { describeValue } from '../src/tscn/value.js';

const SAMPLE = `[gd_scene load_steps=3 format=3]\n\n[ext_resource type="Script" path="res://foo.gd" id="1_foo"]\n\n[sub_resource type="Resource" id="Resource_a"]\nname = "hello (world)"\n\n[node name="Root" type="Control"]\n\n[node name="Child" type="Label" parent="."]\ntext = "Hi [there]"\nscript = ExtResource("1_foo")\nitems = Dictionary[int, ExtResource("2_stack")]({\n0: SubResource("Resource_a"),\n5: SubResource("Resource_b")\n})\n\n[connection signal="pressed" from="Child" to="." method="_on_pressed"]\n`;

test('parses scene header and section groups', () => {
  const doc = parseTscn(SAMPLE);
  assert.equal(doc.header.kind, 'gd_scene');
  assert.equal(doc.header.attributes.format, '3');
  assert.equal(doc.externalResources.length, 1);
  assert.equal(doc.subResources.length, 1);
  assert.equal(doc.nodes.length, 2);
  assert.equal(doc.connections.length, 1);
});

test('keeps multiline typed dictionaries as one lossless property', () => {
  const doc = parseTscn(SAMPLE);
  const value = doc.nodes[1].properties.find((p) => p.key === 'items').value;
  assert.equal(value, 'Dictionary[int, ExtResource("2_stack")]({\n0: SubResource("Resource_a"),\n5: SubResource("Resource_b")\n})');
});

test('quoted delimiters do not affect multiline balancing', () => {
  const doc = parseTscn(SAMPLE);
  assert.equal(doc.subResources[0].properties[0].value, '"hello (world)"');
  assert.equal(doc.nodes[1].properties[0].value, '"Hi [there]"');
});

test('recognizes common Godot values without evaluating them', () => {
  assert.deepEqual(describeValue('true'), { kind: 'boolean', raw: 'true', value: true });
  assert.deepEqual(describeValue('12.5'), { kind: 'number', raw: '12.5', value: 12.5 });
  assert.deepEqual(describeValue('ExtResource("1_foo")'), { kind: 'ext-resource', raw: 'ExtResource("1_foo")', id: '1_foo' });
  assert.deepEqual(describeValue('SubResource("Resource_a")'), { kind: 'sub-resource', raw: 'SubResource("Resource_a")', id: 'Resource_a' });
  assert.equal(describeValue('Vector2(1, 2)').kind, 'vector');
  assert.equal(describeValue('Color(1, 0, 0, 1)').kind, 'color');
  assert.equal(describeValue('Dictionary[int, String]({0:"x"})').kind, 'expression');
});

test('reports the starting line for an unterminated multiline value', () => {
  assert.throws(
    () => parseTscn('[gd_scene format=3]\n[node name="Root"]\ndata = {\n1: 2\n'),
    /line 3/i,
  );
});
