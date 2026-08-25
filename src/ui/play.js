import { runnerUrl, viewerUrl } from '../play/preview.js';

function makeButton(label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button secondary';
  button.textContent = label;
  return button;
}

async function copyLink(button, url, idleLabel) {
  try {
    await navigator.clipboard.writeText(url);
    button.textContent = 'Copied!';
  } catch {
    button.textContent = 'Copy failed';
  }
  window.setTimeout(() => { button.textContent = idleLabel; }, 1400);
}

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
  info.className = 'play-toolbar-info';
  info.textContent = `Godot ${manifest.godot_version} · preview build ${manifest.source_sha ? manifest.source_sha.slice(0, 8) : 'unknown'}`;

  const actions = document.createElement('div');
  actions.className = 'play-toolbar-actions';

  const copyViewer = makeButton('Copy viewer link');
  const copyFullscreen = makeButton('Copy fullscreen link');
  const openFullscreen = makeButton('Open fullscreen');
  const restart = makeButton('Restart');

  const viewerShareUrl = viewerUrl(target);
  const fullscreenUrl = runnerUrl(target, manifest);

  copyViewer.addEventListener('click', () => copyLink(copyViewer, viewerShareUrl, 'Copy viewer link'));
  copyFullscreen.addEventListener('click', () => copyLink(copyFullscreen, fullscreenUrl, 'Copy fullscreen link'));
  openFullscreen.addEventListener('click', () => window.open(fullscreenUrl, '_blank', 'noopener,noreferrer'));

  actions.append(copyViewer, copyFullscreen, openFullscreen, restart);
  toolbar.append(info, actions);

  const frame = document.createElement('iframe');
  frame.className = 'play-frame';
  frame.title = `Playable preview of ${target.path}`;
  frame.sandbox = 'allow-scripts allow-pointer-lock';
  frame.allow = 'fullscreen; autoplay; gamepad';
  frame.referrerPolicy = 'no-referrer';

  const start = () => {
    frame.src = 'about:blank';
    requestAnimationFrame(() => { frame.src = fullscreenUrl; });
  };
  restart.addEventListener('click', start);
  frame.src = fullscreenUrl;

  shell.append(toolbar, frame);
  container.append(shell);
}
