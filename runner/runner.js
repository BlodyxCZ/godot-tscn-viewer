(() => {
  const params = new URLSearchParams(location.search);
  const owner = params.get('owner');
  const repo = params.get('repo');
  const scene = params.get('scene');
  const godot = params.get('godot');
  const pack = params.get('pack');
  const status = document.getElementById('status');
  const progress = document.getElementById('progress');
  const overlay = document.getElementById('overlay');
  const errorBox = document.getElementById('error');
  const canvas = document.getElementById('canvas');

  function fail(message) {
    status.textContent = 'Preview failed';
    progress.hidden = true;
    errorBox.textContent = message;
    parent.postMessage({ type: 'tscn-preview-error', message }, '*');
  }

  function validate() {
    if (!owner || !/^[A-Za-z0-9_.-]+$/.test(owner)) throw new Error('Invalid repository owner.');
    if (!repo || !/^[A-Za-z0-9_.-]+$/.test(repo)) throw new Error('Invalid repository name.');
    if (!scene || !scene.startsWith('res://') || !scene.endsWith('.tscn') || scene.includes('..')) throw new Error('Invalid scene path.');
    if (!godot || !/^4\.7(?:\.\d+)?$/.test(godot)) throw new Error('Unsupported Godot runtime.');
    if (!pack || !/^[A-Za-z0-9._/-]+$/.test(pack) || pack.includes('..') || !pack.endsWith('.pck')) throw new Error('Invalid pack path.');
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load Godot runtime: ${src}`));
      document.head.append(script);
    });
  }

  async function fetchPack() {
    const path = pack.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}?ref=tscn-preview`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        'X-GitHub-Api-Version': '2026-03-10',
      },
    });
    if (!response.ok) throw new Error(`Could not download preview.pck (GitHub HTTP ${response.status}).`);
    return response.arrayBuffer();
  }

  async function main() {
    validate();
    const runtimeRoot = new URL(`../runtime/${godot}/`, location.href);
    const runtimeBase = new URL('godot', runtimeRoot).toString().replace(/\/$/, '');
    status.textContent = `Loading Godot ${godot}…`;
    await loadScript(new URL('godot.js', runtimeRoot).toString());
    if (typeof Engine !== 'function') throw new Error('Godot runtime did not expose Engine.');

    status.textContent = 'Downloading project preview…';
    const packBuffer = await fetchPack();

    const engine = new Engine({
      canvas,
      executable: runtimeBase,
      canvasResizePolicy: 2,
      focusCanvas: true,
      onProgress(current, total) {
        if (total > 0) progress.value = current / total;
      },
      onPrint(text) { console.log(`[Godot] ${text}`); },
      onPrintError(text) { console.error(`[Godot] ${text}`); },
      onExit(code) { parent.postMessage({ type: 'tscn-preview-exit', code }, '*'); },
    });

    status.textContent = 'Starting scene…';
    await engine.init(runtimeBase);
    await engine.preloadFile(packBuffer, '/preview.pck');
    await engine.start({ args: ['--main-pack', '/preview.pck', '--', scene] });
    overlay.hidden = true;
    canvas.focus();
    parent.postMessage({ type: 'tscn-preview-ready' }, '*');
  }

  main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
})();
