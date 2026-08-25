# Playable TSCN Previews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add opt-in real-Godot playable scene previews backed by generated packs stored in each target repository.

**Architecture:** A reusable workflow builds a launchable `.pck` and publishes it to the caller's `tscn-preview` branch. The viewer detects the manifest and runs the pack inside a sandboxed iframe using a centrally hosted Godot 4.7 Web runtime.

**Tech Stack:** GitHub Actions, Godot 4.7 headless/Web export, static ES modules, GitHub REST API, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-25-playable-previews-design.md`

## Global Constraints
- Do not store caller game packs in the viewer repository.
- Do not require caller GitHub Pages.
- Run untrusted Godot content in a sandboxed iframe without `allow-same-origin`.
- v1 supports Godot 4.7 GDScript and disables threads/GDExtension.
- Preserve permanent scene URLs.

---

### Task 1: Preview discovery client
**Files:** Create `src/play/preview.js`; Test `tests/preview.test.mjs`.
- [ ] Test manifest/API URL construction and validation.
- [ ] Implement preview discovery helpers.
- [ ] Run `npm test`.

### Task 2: Play UI and sandbox runner
**Files:** Modify `index.html`, `src/app.js`, `src/styles.css`; Create `src/ui/play.js`, `runner/index.html`, `runner/runner.js`; Test `tests/ui-contract.test.mjs`.
- [ ] Add Play tab and unavailable/setup states.
- [ ] Add sandboxed iframe lifecycle.
- [ ] Implement runner that fetches manifest/pack, preloads it, and starts Godot with the selected scene.
- [ ] Run tests and JS syntax checks.

### Task 3: Reusable preview builder
**Files:** Create `.github/workflows/build-preview.yml`, `.github/preview/PreviewLauncher.gd`, `.github/preview/PreviewLauncher.tscn`, `.github/preview/export_presets.cfg`.
- [ ] Install Godot/export templates in caller workflow.
- [ ] Generate/patch temporary project configuration.
- [ ] Export `preview.pck` and manifest.
- [ ] Force-publish generated `tscn-preview` branch.

### Task 4: Central Web runtime deployment
**Files:** Modify `.github/workflows/pages.yml`; Create `.github/runtime/project.godot`, `.github/runtime/export_presets.cfg`.
- [ ] Build Godot 4.7 Web runtime during Pages deployment.
- [ ] Publish runtime files beside the static viewer.
- [ ] Keep existing test gate.

### Task 5: Swift Inventory integration
**Files in `BlodyxCZ/Swift-Inventory-Godot-Addon`:** Create `.github/workflows/tscn-preview.yml`.
- [ ] Add caller workflow with `contents: write`.
- [ ] Run it and inspect generated branch/manifest.
- [ ] Open the Swift Inventory example through the viewer and verify Play discovery.
