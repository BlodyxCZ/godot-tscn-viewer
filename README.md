# Godot TSCN Viewer

A browser-only structural viewer for public Godot 4 `.tscn` scene files hosted on GitHub.

It turns Godot's text scene format into a navigable scene tree with an inspector, external/embedded resources, signal connections, and the original source. It does **not** execute GDScript, `@tool` scripts, or scene resources.

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

Scene files are treated as untrusted data. The viewer fetches a public `.tscn` file from `raw.githubusercontent.com`, parses it as text, and renders scene-controlled strings through DOM text APIs. It never executes scripts referenced by a scene and never requests a GitHub token.

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

This is a structural scene viewer, not a Godot renderer. Actual 2D/3D viewport rendering, private-repository authentication, recursive instanced-scene expansion, `.tres` top-level viewing, and visual scene diffs are deferred.

## License

MIT
