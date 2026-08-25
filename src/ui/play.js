import { runnerUrl } from '../play/preview.js';

export function renderPlay(container, target, manifest) {
  container.replaceChildren();

  if (!manifest) {
    const wrap = document.createElement('div');
    wrap.className = 'play-empty';
    const title = document.createElement('h2');
    title.textContent = 'Playable preview not enabled';
    const text = document.createElement('p');
    text.textContent = 'This repository has not published a tscn-preview build yet.';
    const code = document.createElement('pre');
    code.textContent = `jobs:\n  preview:\n    uses: BlodyxCZ/godot-tscn-viewer/.github/workflows/build-preview.yml@main\n    with:\n      godot-version: \"4.7\"`;
    wrap.append(title, text, code);
    container.append(wrap);
    return;
  }

  const shell = document.createElement('div');
  shell.className = 'play-shell';

  const toolbar = document.createElement('div');
  toolbar.className = 'play-toolbar';
  const info = document.createElement('span');
  info.textContent = `Godot ${manifest.godot_version} · preview build ${manifest.source_sha ? manifest.source_sha.slice(0, 8) : 'unknown'}`;
  const restart = document.createElement('button');
  restart.type = 'button';
  restart.className = 'button secondary';
  restart.textContent = 'Restart';
  toolbar.append(info, restart);

  const frame = document.createElement('iframe');
  frame.className = 'play-frame';
  frame.title = `Playable preview of ${target.path}`;
  frame.sandbox = 'allow-scripts allow-pointer-lock';
  frame.allow = 'fullscreen; autoplay; gamepad';
  frame.referrerPolicy = 'no-referrer';

  const src = runnerUrl(target, manifest);
  const start = () => {
    frame.src = 'about:blank';
    requestAnimationFrame(() => { frame.src = src; });
  };
  restart.addEventListener('click', start);
  frame.src = src;

  shell.append(toolbar, frame);
  container.append(shell);
}
