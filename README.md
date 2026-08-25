# Godot TSCN Viewer

<p align="center">
  <strong>Inspect, share, and play Godot <code>.tscn</code> scenes directly from GitHub.</strong>
</p>

<p align="center">
  <a href="https://blodyxcz.github.io/godot-tscn-viewer/"><img alt="Open Viewer" src="https://img.shields.io/badge/Open-Viewer-478CBF?style=for-the-badge&logo=godot-engine&logoColor=white"></a>
  <a href="https://blodyxcz.github.io/godot-tscn-viewer/runner/?owner=BlodyxCZ&repo=Swift-Inventory-Godot-Addon&scene=res%3A%2F%2Faddons%2FSwift_Inventory%2FExample%2Fexample_scene.tscn&godot=4.7&pack=preview.pck"><img alt="Play Demo" src="https://img.shields.io/badge/▶-Play_Demo-2ea44f?style=for-the-badge"></a>
</p>

<p align="center">
  <img alt="Version 1.0.0" src="https://img.shields.io/badge/version-1.0.0-blue">
  <img alt="Godot 4.0 through 4.8" src="https://img.shields.io/badge/Godot-4.0--4.8-478CBF?logo=godot-engine&logoColor=white">
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-green">
  <img alt="No backend" src="https://img.shields.io/badge/backend-none-lightgrey">
</p>

---

## What is it?

**Godot TSCN Viewer** is a browser-based viewer for public Godot 4 scene files hosted on GitHub.

Paste a GitHub `.tscn` URL and get a readable view of the scene without cloning the repository or opening Godot.

Repositories can also opt in to **real playable Godot previews** with a small reusable GitHub Actions workflow. The preview pack is built using the selected Godot version and then executed in a sandboxed Godot Web runtime.

### Viewer features

- 🌳 **Scene tree** — browse nodes and hierarchy
- 🔎 **Inspector** — inspect node declarations and properties
- 📦 **Resources** — inspect `ExtResource` and `SubResource` entries
- 🔗 **Connections** — view signal connections
- 🧾 **Source** — read the original `.tscn`
- ▶️ **Play** — run the selected scene using the real Godot engine
- 🔒 **Safe rendering** — structural scene text is never evaluated as JavaScript
- ⚡ **No backend** — the viewer runs entirely in the browser

---

## Try it

### Open the viewer

**https://blodyxcz.github.io/godot-tscn-viewer/**

Paste any public GitHub scene URL, for example:

```text
https://github.com/BlodyxCZ/Swift-Inventory-Godot-Addon/blob/main/addons/Swift_Inventory/Example/example_scene.tscn
```

### Permanent scene link

```text
https://blodyxcz.github.io/godot-tscn-viewer/?url=https://github.com/OWNER/REPO/blob/REF/path/to/scene.tscn
```

Canonical query parameters are also supported:

```text
?repo=OWNER/REPO&ref=REF&path=path/to/scene.tscn
```

---

# ▶ Playable previews

A repository can opt in once and make its Godot scenes permanently playable through the viewer.

The project remains in **its own repository**. Godot TSCN Viewer does not store copies of other projects.

```text
Godot repository
      │
      │ push to main
      ▼
GitHub Actions
      │
      ├─ downloads the selected Godot release
      ├─ injects the preview launcher
      └─ exports preview.pck
      │
      ▼
tscn-preview branch
├── preview.json
└── preview.pck
      │
      ▼
Godot TSCN Viewer
      │
      ├─ resolves a sandbox-safe Web runtime
      └─ launches the selected .tscn
      │
      ▼
   ▶ playable scene
```

## Enable Play for your repository

Create:

```text
.github/workflows/tscn-preview.yml
```

with:

```yaml
name: TSCN playable preview

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  preview:
    uses: BlodyxCZ/godot-tscn-viewer/.github/workflows/build-preview.yml@main
    with:
      godot-version: "4.7"
```

Set `godot-version` to the Godot 4.x minor line used by your project:

```text
4.0  4.1  4.2  4.3  4.4  4.5  4.6  4.7  4.8
```

The workflow pins each minor line to a tested Godot build, so previews remain reproducible even when new patch releases appear.

After the workflow completes, it creates a generated branch:

```text
tscn-preview
├── preview.json
└── preview.pck
```

Every compatible `.tscn` in that project can then use the **Play** tab without creating a separate export per scene.

### Addon-only repositories

Repositories without a `project.godot` are supported too.

The workflow generates a temporary minimal Godot project in CI, builds the preview pack, and leaves the source repository untouched.

---

## Godot version support

Playable previews support selectable **Godot 4.0 through 4.8** minor lines.

| Selected line | Pack builder | Browser Web runtime |
|---|---|---|
| `4.0` | Godot `4.0.4-stable` | Godot `4.3` single-thread |
| `4.1` | Godot `4.1.4-stable` | Godot `4.3` single-thread |
| `4.2` | Godot `4.2.2-stable` | Godot `4.3` single-thread |
| `4.3` | Godot `4.3-stable` | Godot `4.3` single-thread |
| `4.4` | Godot `4.4.1-stable` | Godot `4.4` single-thread |
| `4.5` | Godot `4.5.2-stable` | Godot `4.5` single-thread |
| `4.6` | Godot `4.6.3-stable` | Godot `4.6` single-thread |
| `4.7` | Godot `4.7.2-stable` | Godot `4.7` single-thread |
| `4.8` | Godot `4.8-dev3` | Godot `4.8` single-thread |

### Why 4.0–4.2 use the 4.3 Web runtime

Godot 4.0–4.2 Web exports are threaded and require cross-origin isolation. That conflicts with the viewer's intentionally restrictive opaque-origin iframe sandbox.

The preview pack is still built with the project's selected 4.0, 4.1, or 4.2 editor. Only browser execution is forwarded to the tested Godot 4.3 single-thread Web runtime. This compatibility path has been verified end-to-end through the preview launcher.

### Godot 4.8

Godot 4.8 is currently a **preview line**, because `4.8-stable` has not been released yet. The `4.8` selection is currently pinned to **`4.8-dev3`** and will be moved to the stable release after it ships and passes the compatibility suite.

---

## Standalone playable demo

The viewer includes a standalone runner that displays **only the Godot scene**, without the inspector UI.

When a playable scene is open, the **Play** toolbar gives you the share links directly:

- **Copy viewer link** — copies the normal viewer URL for the current `.tscn`.
- **Copy fullscreen link** — copies the standalone playable runner URL.
- **Open fullscreen** — opens the standalone playable preview in a new tab.

Example:

```text
https://blodyxcz.github.io/godot-tscn-viewer/runner/?owner=BlodyxCZ&repo=Swift-Inventory-Godot-Addon&scene=res%3A%2F%2Faddons%2FSwift_Inventory%2FExample%2Fexample_scene.tscn&godot=4.7&pack=preview.pck
```

The runner resolves the correct hosted Web runtime from the selected project version. Existing 4.7 runner links remain valid.

This is useful for demo pages, documentation sites, portfolios, and project websites.

### Embed it on a website

```html
<iframe
  src="https://blodyxcz.github.io/godot-tscn-viewer/runner/?owner=OWNER&repo=REPO&scene=res%3A%2F%2Fpath%2Fto%2Fscene.tscn&godot=4.7&pack=preview.pck"
  width="960"
  height="540"
  sandbox="allow-scripts allow-pointer-lock"
  allow="fullscreen; gamepad"
></iframe>
```

> GitHub README pages do not allow interactive iframes or scripts. For GitHub, use a screenshot/GIF or **Play Demo** badge linking to the standalone runner instead.

---

## Supported in v1.0.0

| Feature | Support |
|---|---|
| Public GitHub `.tscn` inspection | ✅ |
| Godot 4.0–4.7 stable project lines | ✅ |
| Godot 4.8 preview line | ✅ Experimental |
| GDScript projects | ✅ |
| Normal Godot projects | ✅ |
| Addon-only repositories | ✅ |
| `Control` / UI scenes | ✅ |
| 2D scenes | ✅ |
| Web-compatible 3D scenes | ✅ |
| Real scripts, signals and physics in Play mode | ✅ |
| C# / .NET Web projects | ❌ |
| GDExtension projects | ❌ |
| Private GitHub repositories | ❌ |

Preview packs are currently limited to **95 MB**.

---

## Security model

There are two separate trust levels.

### Structural viewer

A `.tscn` file is treated as untrusted text.

The viewer:

- fetches the public file directly from GitHub
- parses it without executing project scripts
- preserves unknown Godot expressions as text
- renders scene-controlled strings through safe DOM text APIs

### Play mode

Playable previews execute the project's actual Godot code, so they run inside a sandboxed iframe:

```text
sandbox="allow-scripts allow-pointer-lock"
```

`allow-same-origin` is intentionally omitted.

Godot 4.0–4.2 are routed through the 4.3 single-thread runtime specifically so this sandbox does **not** need to be weakened for threaded Web execution.

The viewer never asks visitors for a GitHub token, and generated game data stays in the original project's `tscn-preview` branch.

---

## How the shared runtime works

Target repositories publish only their generated Godot project pack.

The Godot Web engines are hosted by this project and reused by every playable preview:

```text
godot-tscn-viewer
└── runtime/
    ├── 4.3/
    ├── 4.4/
    ├── 4.5/
    ├── 4.6/
    ├── 4.7/
    └── 4.8/

project repository
└── tscn-preview/
    ├── preview.json
    └── preview.pck
```

Each runtime directory contains its matching `godot.js`, `godot.wasm`, and Web support files. GitHub Actions caches the extracted runtime bundles, so the large official export-template archive only needs to be downloaded when a runtime cache is first populated or its pinned release changes.

---

## Development

The viewer itself has no application build step or runtime package dependencies.

Start a local server:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/
```

Run the test suite:

```bash
npm test
```

Tests use Node's built-in `node:test` runner.

The production site is deployed through `.github/workflows/pages.yml` on pushes to `main`.

---

## v1.0.0

Version **1.0.0** marks the first complete release of Godot TSCN Viewer:

- structural `.tscn` inspection
- permanent GitHub scene links
- repository-owned playable preview packs
- reusable GitHub Actions integration
- selectable Godot 4.x preview builders
- shared sandbox-safe Godot Web runtimes
- addon-only repository support
- standalone playable runner
- sandboxed execution

---

## License

[MIT](LICENSE)
