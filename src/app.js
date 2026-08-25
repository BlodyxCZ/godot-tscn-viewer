import { parseGitHubBlobUrl, parseViewerQuery, rawContentUrl, githubBlobUrl } from './github.js';
import { parseTscn } from './tscn/parser.js';
import { buildSceneTree } from './model/scene-tree.js';
import { renderSceneTree } from './ui/tree.js';
import { renderInspector } from './ui/inspector.js';
import { renderResources } from './ui/resources.js';
import { renderConnections } from './ui/connections.js';
import { renderSource } from './ui/source.js';
import { discoverPreview } from './play/preview.js';
import { renderPlay } from './ui/play.js';

const $ = (selector) => document.querySelector(selector);
const form = $('#open-form');
const input = $('#scene-url');
const status = $('#status');
const viewer = $('#viewer');
const meta = $('#file-meta');
const githubLink = $('#github-link');
const treeContainer = $('#scene-tree');
const inspector = $('#inspector');
const resourcesView = $('#resources-view');
const connectionsView = $('#connections-view');
const sourceView = $('#source-view');
const playView = $('#play-view');

let state = null;

function setStatus(message, kind = 'muted') {
  status.textContent = message;
  status.className = `status ${kind}`;
}

function setTab(name) {
  document.querySelectorAll('[data-tab]').forEach((button) => button.classList.toggle('active', button.dataset.tab === name));
  document.querySelectorAll('[data-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === name));
}

function resourceMap(resources) {
  return new Map(resources.map((resource) => [resource.attributes.id, resource]));
}

function showSubResource(id) {
  if (!state) return;
  const section = state.subResources.get(id);
  if (!section) return;
  setTab('scene');
  renderInspector(inspector, section, state.context);
  inspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function loadTarget(target, { replaceHistory = true } = {}) {
  setStatus('Loading scene…');
  viewer.classList.add('hidden');
  const response = await fetch(rawContentUrl(target));
  if (!response.ok) throw new Error(response.status === 404 ? 'Scene not found (GitHub returned 404).' : `GitHub returned HTTP ${response.status}.`);
  const source = await response.text();
  const sceneDocument = parseTscn(source);
  const tree = buildSceneTree(sceneDocument.nodes);
  const externalResources = resourceMap(sceneDocument.externalResources);
  const subResources = resourceMap(sceneDocument.subResources);
  const context = { target, externalResources, subResources, onSubResource: showSubResource };
  state = { target, source, document: sceneDocument, tree, externalResources, subResources, context };

  renderSceneTree(treeContainer, tree, (section) => renderInspector(inspector, section, context));
  renderResources(resourcesView, sceneDocument, target, showSubResource);
  renderConnections(connectionsView, sceneDocument);
  renderSource(sourceView, source);

  let previewManifest = null;
  try {
    previewManifest = await discoverPreview(target);
  } catch (error) {
    console.warn('Playable preview discovery failed:', error);
  }
  renderPlay(playView, target, previewManifest);

  const filename = target.path.split('/').pop();
  meta.textContent = `${target.owner}/${target.repo} · ${target.ref} · ${target.path}`;
  document.title = `${filename} · Godot TSCN Viewer`;
  githubLink.href = githubBlobUrl(target);
  githubLink.classList.remove('hidden');
  input.value = githubBlobUrl(target);
  viewer.classList.remove('hidden');
  setStatus(`Loaded ${sceneDocument.nodes.length} nodes, ${sceneDocument.externalResources.length + sceneDocument.subResources.length} resources, ${sceneDocument.connections.length} connections.`, 'success');

  if (replaceHistory) {
    const query = new URLSearchParams({ repo: `${target.owner}/${target.repo}`, ref: target.ref, path: target.path });
    history.replaceState(null, '', `${location.pathname}?${query}${location.hash}`);
  }
}

async function open(inputValue, options) {
  try {
    const target = typeof inputValue === 'string' ? parseGitHubBlobUrl(inputValue) : inputValue;
    await loadTarget(target, options);
  } catch (error) {
    viewer.classList.add('hidden');
    githubLink.classList.add('hidden');
    setStatus(error instanceof Error ? error.message : String(error), 'error');
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  open(input.value.trim());
});

document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => setTab(button.dataset.tab)));

try {
  const initial = parseViewerQuery(location.search);
  if (initial) open(initial, { replaceHistory: false });
} catch (error) {
  setStatus(error instanceof Error ? error.message : String(error), 'error');
}
