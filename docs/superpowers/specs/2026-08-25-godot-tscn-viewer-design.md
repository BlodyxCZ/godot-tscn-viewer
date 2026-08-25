# Godot TSCN Viewer — Design

## Goal

Create a fully static GitHub Pages application that previews public Godot `.tscn` scene files from GitHub. Users can paste a GitHub blob URL or open the viewer with query parameters. The viewer renders a Godot-like scene tree, an inspector for the selected node, external/sub-resources, signal connections, and raw source.

The first release deliberately does **not** attempt to reproduce the Godot 2D/3D viewport. It is a structural scene viewer.

## Repository

Repository: `BlodyxCZ/godot-tscn-viewer`

Hosting target: `https://blodyxcz.github.io/godot-tscn-viewer/`.

## Supported URLs

Human-friendly form:

`?url=https://github.com/OWNER/REPO/blob/REF/path/to/scene.tscn`

Canonical form:

`?repo=OWNER/REPO&ref=REF&path=path/to/scene.tscn`

The app normalizes both forms to:

```js
{ owner, repo, ref, path }
```

## Architecture

The project is a dependency-light static web app built with HTML, CSS, and ES modules. No backend, database, framework, build system, or authentication is required for the MVP.

### Modules

- `index.html` — application shell and semantic layout.
- `src/app.js` — URL handling, application state, orchestration, view switching, errors.
- `src/github.js` — GitHub URL parsing, raw-file fetching, `res://` to GitHub link resolution.
- `src/tscn/parser.js` — TSCN tokenizer/parser.
- `src/tscn/value.js` — lightweight Godot Variant recognition/pretty-print metadata.
- `src/model/scene-tree.js` — constructs node hierarchy from node declarations and parent paths.
- `src/ui/tree.js` — scene tree rendering/selection.
- `src/ui/inspector.js` — selected node attributes and properties.
- `src/ui/resources.js` — `ext_resource` and `sub_resource` display and resolution.
- `src/ui/connections.js` — signal connection table.
- `src/ui/source.js` — raw source presentation.
- `src/styles.css` — Godot-inspired dark UI without copying Godot proprietary artwork.
- `tests/*.test.mjs` — parser/model tests runnable with Node's built-in test runner.
- `.github/workflows/pages.yml` — static GitHub Pages deployment.

## Data Model

Parser output:

```js
{
  header: { kind: "gd_scene", attributes: {} },
  externalResources: [],
  subResources: [],
  nodes: [],
  connections: [],
  unknownSections: []
}
```

Each section stores its kind, parsed header attributes, ordered properties, and source location where practical. Complex property values remain lossless strings in the MVP. Recognized values additionally receive display metadata so the UI can render references, colors, vectors, booleans, numbers, and quoted strings without needing a complete Godot Variant implementation.

## Parsing Requirements

The parser must handle actual Godot 4 text scene syntax rather than treating the file as ordinary INI.

1. Parse section headers such as `gd_scene`, `ext_resource`, `sub_resource`, `node`, and `connection`.
2. Parse quoted header attributes and bare numeric values.
3. Preserve section order.
4. Parse `key = value` properties.
5. Support multiline property values while delimiters `()`, `[]`, `{}` or quoted strings remain unbalanced.
6. Correctly retain typed expressions such as `Dictionary[int, ExtResource("...")]({...})`.
7. Recognize `ExtResource("id")` and `SubResource("id")` references.
8. Keep unknown Godot expressions intact rather than rejecting the scene.
9. Tolerate metadata and custom-resource properties.
10. Produce useful parse errors with line numbers for malformed input.

## Scene Tree Resolution

A node declaration has a `name` and optional `parent`.

- The first node without `parent` is treated as the scene root.
- `parent="."` attaches to the root.
- `parent="A/B"` resolves from the root through `A/B`.
- Nodes are indexed by their resolved scene path.
- If a parent cannot be resolved, the node is kept in an `Unresolved` group instead of being discarded.
- Instanced scenes are represented as nodes with an instance/resource badge; their child scenes are not recursively fetched in the MVP.

## GitHub Data Access

For a public repository, fetch the file using:

`https://raw.githubusercontent.com/OWNER/REPO/REF/PATH`

Only `github.com` public blob URLs are accepted by the URL parser in the MVP.

### `res://` links

`res://foo/bar.gd` resolves to:

`https://github.com/OWNER/REPO/blob/REF/foo/bar.gd`

External-resource IDs are mapped to their declaration so an inspector value such as `ExtResource("1_abc")` can display the referenced filename and link.

## UI

- Top bar: file name, repository/ref/path, paste/open control, "View on GitHub" link.
- Main tabs: `Scene`, `Resources`, `Connections`, `Source`.
- Scene tab: two-column layout with scene tree on the left and inspector on the right.
- Scene tree: indentation, disclosure controls, type labels, script/resource badges.
- Inspector: header attributes first, then properties in source order.
- Resources: external resources followed by sub-resources.
- Connections: signal, source, target, method and optional flags/binds.
- Source: escaped raw text in a monospace code view.
- Mobile layout stacks tree above inspector.

## Value Presentation

The MVP recognizes values for display but does not evaluate them.

- `true` / `false` → boolean badge
- numbers → numeric text
- quoted values → strings
- `Vector2(...)`, `Vector2i(...)`, `Color(...)` → typed value chips
- `ExtResource("id")` → linked external resource
- `SubResource("id")` → linked internal resource selection
- other expressions → monospace raw value

No arbitrary JavaScript evaluation is used.

## Security

- Treat all scene content as untrusted text.
- Render user-controlled strings with DOM text nodes / `textContent`, never `innerHTML`.
- Do not execute scripts referenced by a scene.
- Do not fetch arbitrary non-GitHub URLs supplied by TSCN resources.
- External links use a validated `github.com` or `raw.githubusercontent.com` origin.
- No GitHub token is stored or requested in the MVP.

## Error Handling

User-visible states cover invalid/missing URL parameters, unsupported host or non-`.tscn` path, GitHub 404/unavailable file, network errors, parse errors with source line, and partially resolvable scene trees.

## Testing

Use Node's built-in `node:test` and `assert` so the project has no test dependency. Cover minimal scenes, nested parents, resources, connections, multiline dictionaries/arrays, Swift Inventory's typed dictionary shape, quoted delimiters, unresolved parent recovery, GitHub URL validation, and `res://` resolution.

## Deployment

GitHub Actions deploys the static repository on pushes to `main` and manual dispatch using the official Pages actions. GitHub Pages must use **GitHub Actions** as its source.

## MVP Acceptance Criteria

1. Opening the viewer with a public GitHub `.tscn` URL loads the scene without a backend.
2. The Swift Inventory `addons/Swift_Inventory/Example/example_scene.tscn` structure parses successfully.
3. Scene hierarchy displays correctly.
4. Selecting a node shows its attributes and properties.
5. `ExtResource` links resolve to the corresponding repository file.
6. Sub-resources are browsable.
7. Signal connections are visible.
8. Raw source is viewable.
9. Invalid input produces a useful error rather than a blank page.
10. Parser/model automated tests pass.
11. The site deploys through GitHub Pages.

## Deferred Features

Out of scope for the first release: actual 2D/3D viewport rendering, executing GDScript or `@tool` scripts, recursive expansion of instanced scenes, private-repository authentication, `.tres` top-level viewer mode, visual scene diffs, and browser-extension integration.
