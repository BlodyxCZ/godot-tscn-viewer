function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function validateTarget(target) {
  if (!target?.owner || !target?.repo || !target?.ref || !target?.path) {
    throw new Error('Missing GitHub target fields.');
  }
  if (!target.path.toLowerCase().endsWith('.tscn')) {
    throw new Error('Only .tscn files are supported.');
  }
  return target;
}

export function parseGitHubBlobUrl(input) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Enter a valid GitHub URL.');
  }

  if (url.protocol !== 'https:' || url.hostname !== 'github.com') {
    throw new Error('Only https://github.com blob URLs are supported.');
  }

  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 5 || parts[2] !== 'blob') {
    throw new Error('URL must point to a GitHub blob.');
  }

  const [owner, repo, , ref, ...pathParts] = parts;
  const target = {
    owner: decodeURIComponent(owner),
    repo: decodeURIComponent(repo),
    ref: decodeURIComponent(ref),
    path: pathParts.map(decodeURIComponent).join('/'),
  };
  return validateTarget(target);
}

export function parseViewerQuery(search) {
  const params = new URLSearchParams(search);
  if (params.has('url')) return parseGitHubBlobUrl(params.get('url'));

  const repoValue = params.get('repo');
  const ref = params.get('ref');
  const path = params.get('path');
  if (!repoValue && !ref && !path) return null;

  const slash = repoValue?.indexOf('/') ?? -1;
  if (slash <= 0 || slash === repoValue.length - 1) {
    throw new Error('repo must use OWNER/REPO format.');
  }

  return validateTarget({
    owner: repoValue.slice(0, slash),
    repo: repoValue.slice(slash + 1),
    ref,
    path,
  });
}

export function rawContentUrl(target) {
  validateTarget(target);
  return `https://raw.githubusercontent.com/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}/${encodeURIComponent(target.ref)}/${encodePath(target.path)}`;
}

export function githubBlobUrl(target, resourcePath = target.path) {
  validateTarget(target);
  return `https://github.com/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}/blob/${encodeURIComponent(target.ref)}/${encodePath(resourcePath)}`;
}

export function resolveResPath(target, value) {
  if (typeof value !== 'string' || !value.startsWith('res://')) return null;
  const path = value.slice('res://'.length).replace(/^\/+/, '');
  return githubBlobUrl(target, path);
}
