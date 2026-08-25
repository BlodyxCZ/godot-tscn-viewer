# Playable TSCN Previews — Design

## Goal
Add an opt-in Play tab to Godot TSCN Viewer that runs the selected scene using the real Godot Web runtime.

## Storage and ownership
Target repositories opt in with a tiny caller workflow. The reusable workflow lives in `BlodyxCZ/godot-tscn-viewer` and builds `preview.pck` plus `preview.json`, then force-publishes only those generated files to a `tscn-preview` branch in the target repository. No generated game data is stored in the viewer repository.

The viewer hosts the Godot Web runtime once under `runtime/<godot-version>/`. Browser clients fetch target-repository preview artifacts through GitHub's REST contents API, which supports CORS, and preload the pack into Godot's virtual filesystem.

## Runtime flow
1. User opens a `.tscn` from a public GitHub repository.
2. Viewer checks `tscn-preview/preview.json` in that same repository.
3. If present and compatible, the Play tab becomes available.
4. Play creates a sandboxed iframe pointing to `runner/index.html`.
5. Runner loads the centrally hosted Godot JS/WASM runtime.
6. Runner fetches `preview.pck` from the target repository with the GitHub REST raw media type.
7. Runner preloads `/preview.pck`, starts Godot with `--main-pack /preview.pck -- <scene>`, and the injected launcher loads and instantiates that scene.

## Builder behavior
The reusable workflow supports normal Godot projects and addon-only repositories. If `project.godot` does not exist, it creates a temporary minimal project. It injects a temporary launcher scene/script, patches `application/run/main_scene` in the CI workspace only, creates a Web export preset with threads and GDExtension disabled, imports the project, and exports a pack.

Generated branch files:
- `preview.pck`
- `preview.json`

Manifest schema v1:
```json
{
  "schema_version": 1,
  "godot_version": "4.7",
  "source_sha": "...",
  "pack_path": "preview.pck",
  "generated_at": "..."
}
```

## Security
Playable content is untrusted. It executes only inside an iframe with `sandbox="allow-scripts allow-pointer-lock"` and without `allow-same-origin`. The runner does not expose parent DOM references or credentials. Viewer/runner communication uses `postMessage` only for lifecycle state.

## Compatibility v1
- Godot 4.7 GDScript: supported.
- 2D, Control, and Web-compatible 3D: supported.
- Addon-only repositories: best effort through generated temporary `project.godot`.
- C#/.NET: unsupported.
- GDExtension: unsupported in v1.
- Threaded Web exports: disabled.

## Failure behavior
Missing `tscn-preview` branch or manifest shows setup instructions instead of Play. Unsupported manifest versions, incompatible Godot versions, unavailable packs, export failures, or runtime errors produce explicit status messages.
