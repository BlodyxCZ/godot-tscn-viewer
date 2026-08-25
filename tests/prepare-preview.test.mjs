import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tooling = path.join(repoRoot, '.github', 'preview');
const prepare = path.join(tooling, 'prepare.py');

test('preview launcher is injected into an exportable non-hidden directory', () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'tscn-preview-'));
  try {
    execFileSync('python3', [prepare, '--project', project, '--tooling', tooling]);

    const projectFile = fs.readFileSync(path.join(project, 'project.godot'), 'utf8');
    assert.match(projectFile, /run\/main_scene="res:\/\/__tscn_viewer_preview\/PreviewLauncher\.tscn"/);

    const launcherPath = path.join(project, '__tscn_viewer_preview', 'PreviewLauncher.tscn');
    assert.equal(fs.existsSync(launcherPath), true);
    assert.match(fs.readFileSync(launcherPath, 'utf8'), /res:\/\/__tscn_viewer_preview\/PreviewLauncher\.gd/);
    assert.equal(fs.existsSync(path.join(project, '.tscn-preview')), false);
  } finally {
    fs.rmSync(project, { recursive: true, force: true });
  }
});
