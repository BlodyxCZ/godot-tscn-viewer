import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const build = fs.readFileSync(new URL('../.github/workflows/build-preview.yml', import.meta.url), 'utf8');
const pages = fs.readFileSync(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');

test('preview builder pins every supported Godot 4.x minor line', () => {
  for (const [line, tag] of Object.entries({
    '4.0': '4.0.4-stable',
    '4.1': '4.1.4-stable',
    '4.2': '4.2.2-stable',
    '4.3': '4.3-stable',
    '4.4': '4.4.1-stable',
    '4.5': '4.5.2-stable',
    '4.6': '4.6.3-stable',
    '4.7': '4.7.2-stable',
    '4.8': '4.8-dev3',
  })) {
    assert.match(build, new RegExp(`'${line}'[^\\n]*'${tag}'`));
  }
  assert.doesNotMatch(build, /godot --headless --path \. --import/);
  assert.match(build, /godotengine\/godot-builds/);
});

test('Pages hosts only sandbox-safe single-thread runtime lines', () => {
  for (const [line, tag] of Object.entries({
    '4.3': '4.3-stable',
    '4.4': '4.4.1-stable',
    '4.5': '4.5.2-stable',
    '4.6': '4.6.3-stable',
    '4.7': '4.7.2-stable',
    '4.8': '4.8-dev3',
  })) {
    assert.match(pages, new RegExp(`line: "${line}"[\\s\\S]*?tag: "${tag}"`));
  }
  assert.doesNotMatch(pages, /line: "4\.[0-2]"/);
  assert.match(pages, /web_nothreads_release\.zip/);
});
