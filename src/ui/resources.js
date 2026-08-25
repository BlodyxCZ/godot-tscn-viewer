import { resolveResPath } from '../github.js';
import { el, clear } from './dom.js';

function resourceCard(resource, target, onSubResource) {
  const type = resource.attributes.type ?? 'Resource';
  const id = resource.attributes.id ?? '(no id)';
  const card = el('article', { className: 'resource-card' });
  card.append(el('div', { className: 'resource-card-heading' },
    el('strong', { text: id }),
    el('span', { className: 'badge', text: type }),
  ));
  if (resource.attributes.path) {
    const href = resolveResPath(target, resource.attributes.path);
    card.append(href
      ? el('a', { className: 'resource-path', href, target: '_blank', rel: 'noopener noreferrer', text: resource.attributes.path })
      : el('div', { className: 'resource-path', text: resource.attributes.path }));
  }
  if (resource.properties.length) card.append(el('div', { className: 'muted', text: `${resource.properties.length} propert${resource.properties.length === 1 ? 'y' : 'ies'}` }));
  if (resource.kind === 'sub_resource') {
    const button = el('button', { type: 'button', className: 'button secondary small', text: 'Inspect' });
    button.addEventListener('click', () => onSubResource(resource.attributes.id));
    card.append(button);
  }
  return card;
}

export function renderResources(container, document, target, onSubResource) {
  clear(container);
  container.append(el('div', { className: 'content-heading' },
    el('div', {}, el('h2', { text: 'Resources' }), el('p', { className: 'muted', text: 'External and embedded resources referenced by this scene.' })),
  ));
  const grid = el('div', { className: 'resource-grid' });
  for (const resource of document.externalResources) grid.append(resourceCard(resource, target, onSubResource));
  for (const resource of document.subResources) grid.append(resourceCard(resource, target, onSubResource));
  if (!grid.children.length) grid.append(el('div', { className: 'empty-state', text: 'No resources declared.' }));
  container.append(grid);
}
