const PREVIEW_BRANCH = 'tscn-preview';
const API_ROOT = 'https://api.github.com';

function assertRepoTarget(target) {
  if (!target || !target.owner || !target.repo) throw new Error('Repository target is required.');
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

export function previewManifestApiUrl(target) {
  assertRepoTarget(target);
  return `${API_ROOT}/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}/contents/preview.json?ref=${PREVIEW_BRANCH}`;
}

export function previewPackApiUrl(target, packPath = 'preview.pck') {
  assertRepoTarget(target);
  if (!/^[A-Za-z0-9._/-]+$/.test(packPath) || packPath.startsWith('/') || packPath.includes('..')) {
    throw new Error('Unsafe preview pack path.');
  }
  return `${API_ROOT}/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}/contents/${encodePath(packPath)}?ref=${PREVIEW_BRANCH}`;
}

export function validatePreviewManifest(input) {
  if (!input || typeof input !== 'object') throw new Error('Invalid preview manifest.');
  if (input.schema_version !== 1) throw new Error(`Unsupported preview manifest schema: ${input.schema_version ?? 'missing'}.`);
  if (typeof input.godot_version !== 'string' || !/^4\.7(?:\.\d+)?$/.test(input.godot_version)) {
    throw new Error(`Unsupported Godot preview version: ${input.godot_version ?? 'missing'}.`);
  }
  const packPath = input.pack_path;
  if (typeof packPath !== 'string' || !/^[A-Za-z0-9._/-]+$/.test(packPath) || packPath.startsWith('/') || packPath.includes('..') || !packPath.endsWith('.pck')) {
    throw new Error('Invalid preview pack path.');
  }
  return {
    schema_version: 1,
    godot_version: input.godot_version,
    source_sha: typeof input.source_sha === 'string' ? input.source_sha : '',
    pack_path: packPath,
    generated_at: typeof input.generated_at === 'string' ? input.generated_at : '',
  };
}

export async function discoverPreview(target, fetchImpl = fetch) {
  const response = await fetchImpl(previewManifestApiUrl(target), {
    headers: {
      Accept: 'application/vnd.github.raw+json',
      'X-GitHub-Api-Version': '2026-03-10',
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Preview manifest request failed with HTTP ${response.status}.`);
  return validatePreviewManifest(await response.json());
}

export function runnerUrl(target, manifest, baseUrl = document.baseURI) {
  const url = new URL('./runner/', baseUrl);
  url.searchParams.set('owner', target.owner);
  url.searchParams.set('repo', target.repo);
  url.searchParams.set('scene', `res://${target.path}`);
  url.searchParams.set('godot', manifest.godot_version);
  url.searchParams.set('pack', manifest.pack_path);
  return url.toString();
}
