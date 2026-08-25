#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import argparse
import shutil


def set_project_setting(text: str, section: str, key: str, value: str) -> str:
    lines = text.splitlines()
    section_header = f"[{section}]"
    section_start = None
    section_end = len(lines)

    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped == section_header:
            section_start = i
            continue
        if section_start is not None and i > section_start and stripped.startswith("[") and stripped.endswith("]"):
            section_end = i
            break

    setting_line = f'{key}={value}'
    if section_start is None:
        if lines and lines[-1].strip():
            lines.append("")
        lines.extend([section_header, setting_line])
        return "\n".join(lines) + "\n"

    for i in range(section_start + 1, section_end):
        if lines[i].split("=", 1)[0].strip() == key:
            lines[i] = setting_line
            return "\n".join(lines) + "\n"

    lines.insert(section_end, setting_line)
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", default=".")
    parser.add_argument("--tooling", required=True)
    args = parser.parse_args()

    root = Path(args.project).resolve()
    tooling = Path(args.tooling).resolve()
    project_file = root / "project.godot"

    if project_file.exists():
        text = project_file.read_text(encoding="utf-8")
    else:
        text = '; Generated temporarily by Godot TSCN Viewer\nconfig_version=5\n\n[application]\nconfig/name="TSCN Preview"\n\n[display]\nwindow/size/viewport_width=1152\nwindow/size/viewport_height=648\n\n[rendering]\nrenderer/rendering_method="gl_compatibility"\nrenderer/rendering_method.mobile="gl_compatibility"\n'

    text = set_project_setting(text, "application", "run/main_scene", '"res://__tscn_viewer_preview/PreviewLauncher.tscn"')
    project_file.write_text(text, encoding="utf-8")

    preview_dir = root / "__tscn_viewer_preview"
    preview_dir.mkdir(exist_ok=True)
    shutil.copy2(tooling / "PreviewLauncher.gd", preview_dir / "PreviewLauncher.gd")
    shutil.copy2(tooling / "PreviewLauncher.tscn", preview_dir / "PreviewLauncher.tscn")
    shutil.copy2(tooling / "export_presets.cfg", root / "export_presets.cfg")


if __name__ == "__main__":
    main()
