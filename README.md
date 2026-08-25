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
  <img alt="Godot 4.7" src="https://img.shields.io/badge/Godot-4.7-478CBF?logo=godot-engine&logoColor=white">
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-green">
  <img alt="No backend" src="https://img.shields.io/badge/backend-none-lightgrey">
</p>

---

## What is it?

**Godot TSCN Viewer** is a browser-based viewer for public Godot 4 scene files hosted on GitHub.

Paste a GitHub `.tscn` URL and get a readable view of the scene without cloning the repository or opening Godot.

It can also run **real playable Godot Web previews** for repositories that opt in with a tiny reusable GitHub Actions workflow.

### Viewer features

- 🌳 **Scene tree** — browse nodes and hierarchy
- 🔎 **Inspector** — inspect node declarations and properties
- 📦 **Resources** — inspect `ExtResource` and `SubResource` entries
- 🔗 **Connections** — view signal connections
- 🧾 **Source** — read the original `.tscn`
- ▶️ **Play** — run the selected scene using the real Godot Web runtime
- 🔒 **Safe rendering** — scene text is never evaluated as JavaScript
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
      ├─ imports the project with Godot
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
      ├─ shared Godot Web runtime
      └─ selected .tscn
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

That's it.

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

## Standalone playable demo

The viewer includes a standalone runner that displays **only the Godot scene**, without the inspector UI.

Example:

```text
https://blodyxcz.github.io/godot-tscn-viewer/runner/?owner=BlodyxCZ&repo=Swift-Inventory-Godot-Addon&scene=res%3A%2F%2Faddons%2FSwift_Inventory%2FExample%2Fexample_scene.tscn&godot=4.7&pack=preview.pck
```

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
| Godot 4.7 | ✅ |
| GDScript projects | ✅ |
| Normal Godot projects | ✅ |
| Addon-only repositories | ✅ |
| `Control` / UI scenes | ✅ |
| 2D scenes | ✅ |
| Web-compatible 3D scenes | ✅ |
| Real scripts, signals and physics in Play mode | ✅ |
| C# / .NET Web projects | ❌ |
| GDExtension projects | ❌ |
| Threaded Web builds | ❌ |
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

The viewer never asks visitors for a GitHub token, and generated game data stays in the original project's `tscn-preview` branch.

---

## How the shared runtime works

Target repositories publish only their generated Godot project pack.

The ~40 MB Godot Web engine is hosted once by this project and reused by every playable preview:

```text
godot-tscn-viewer
└── runtime/4.7/
    ├── godot.js
    ├── godot.wasm
    └── audio worklets

project repository
└── tscn-preview/
    ├── preview.json
    └── preview.pck
```

This keeps preview repositories small and avoids duplicating the Godot runtime for every project.

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
- shared Godot 4.7 Web runtime
- addon-only repository support
- standalone playable runner
- sandboxed execution

---

## License

[MIT](LICENSE)
