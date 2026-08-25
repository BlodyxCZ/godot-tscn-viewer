# Godot TSCN Viewer

A browser-based viewer for public Godot 4 `.tscn` scene files hosted on GitHub.

It turns Godot's text scene format into a navigable scene tree with an inspector, external/embedded resources, signal connections, and the original source. Repositories can optionally opt in to a **Play** tab that runs a generated Godot Web preview pack inside a sandboxed iframe.

## Open a scene

Hosted URL (after GitHub Pages is enabled):

`https://blodyxcz.github.io/godot-tscn-viewer/`

Paste a GitHub blob URL such as:

`https://github.com/BlodyxCZ/Swift-Inventory-Godot-Addon/blob/main/addons/Swift_Inventory/Example/example_scene.tscn`

You can also link directly to a scene:

```text
https://blodyxcz.github.io/godot-tscn-viewer/?url=https://github.com/OWNER/REPO/blob/REF/path/to/scene.tscn
```

or use canonical query parameters:

```text
?repo=OWNER/REPO&ref=REF&path=path/to/scene.tscn
```

## What it previews

- Scene node hierarchy and node types
- Node declaration attributes and properties
- `ExtResource(...)` references with links back to GitHub
- `SubResource(...)` declarations
- Signal connections
- Raw `.tscn` source
- Multiline Godot values such as typed dictionaries and arrays

Unknown Godot Variant expressions are preserved as text instead of evaluated.

## Security model

Scene files are treated as untrusted data. The structural viewer fetches a public `.tscn`, parses it as text, and renders scene-controlled strings through DOM text APIs without executing the referenced scripts.

Playable previews are opt-in and execute the project's generated Godot pack inside a sandboxed iframe without `allow-same-origin`. The runner only receives the selected scene path and the repository-owned preview pack; the viewer never asks visitors for a GitHub token.

## Development

There is no build step and no runtime dependency.

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

Run the tests with:

```bash
npm test
```

The test suite uses Node's built-in `node:test` runner.

## GitHub Pages

The repository includes `.github/workflows/pages.yml`, which tests the viewer and deploys the static repository through GitHub Pages on pushes to `main`.

In **Settings → Pages**, set **Source** to **GitHub Actions** if it is not already selected.

## Scope

Structural inspection works for public `.tscn` files without project setup. Playable previews require an opted-in generated pack. Private-repository authentication, zero-setup arbitrary-project execution, C#/.NET Web execution, GDExtension Web execution, recursive instanced-scene expansion, `.tres` top-level viewing, and visual scene diffs are deferred.

## License

MIT

## Playable previews

Repositories can opt in to the **Play** tab by publishing a generated Godot preview pack. The pack stays in the project repository on a generated `tscn-preview` branch; this viewer only hosts the shared Godot Web runtime.

Add this workflow to a public Godot repository:

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

After the workflow succeeds, any `.tscn` URL from that repository can use the same permanent viewer URL and its **Play** tab. The workflow supports normal Godot projects and addon-only repositories without `project.godot` by creating temporary CI-only project metadata.

Current v1 limitations: Godot 4.7 GDScript only, no C#/.NET, no GDExtension, no threaded Web builds, and preview packs must stay below 95 MB.
