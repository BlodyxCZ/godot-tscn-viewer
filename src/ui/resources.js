import { resolveResPath } from '../github.js';
import { el, clear } from './dom.js';

function filenameFromPath(path) {
  if (typeof path !== 'string' || !path) return '';
  const clean = path.split(/[?#]/, 1)[0];
  const parts = clean.split('/').filter(Boolean);
  return parts.at(-1) ?? clean;
}

export function resourceDisplayName(resource) {
  if (resource.kind === 'ext_resource') {
    return filenameFromPath(resource.attributes.path)
      || resource.attributes.type
      || resource.attributes.id
      || 'Resource';
  }
  return resource.attributes.type
    || resource.attributes.id
    || 'Resource';
}

function resourceRow(resource, target, onSubResource) {
  const type = resource.attributes.type ?? 'Resource';
  const id = resource.attributes.id ?? '(no id)';
  const name = resourceDisplayName(resource);
  const row = el('article', { className: 'resource-row' });

  const main = el('div', { className: 'resource-main' },
    el('div', { className: 'resource-name', text: name }),
    el('div', { className: 'resource-meta' },
      el('span', { className: 'resource-type', text: type }),
      el('span', { className: 'resource-id', text: `ID: ${id}` }),
    ),
  );
  row.append(main);

  if (resource.attributes.path) {
    const href = resolveResPath(target, resource.attributes.path);
    row.append(href
      ? el('a', {
        className: 'resource-path',
        href,
        target: '_blank',
        rel: 'noopener noreferrer',
        text: resource.attributes.path,
      })
      : el('div', { className: 'resource-path', text: resource.attributes.path }));
  }

  const trailing = el('div', { className: 'resource-trailing' });
  if (resource.properties.length) {
    trailing.append(el('span', {
      className: 'resource-property-count',
      text: `${resource.properties.length} propert${resource.properties.length === 1 ? 'y' : 'ies'}`,
    }));
  }
  if (resource.kind === 'sub_resource') {
    const button = el('button', { type: 'button', className: 'button secondary small', text: 'Inspect' });
    button.addEventListener('click', () => onSubResource(resource.attributes.id));
    trailing.append(button);
  }
  if (trailing.children.length) row.append(trailing);

  return row;
}

function resourceSection(title, resources, target, onSubResource) {
  const section = el('section', { className: 'resource-section' });
  section.append(el('div', { className: 'resource-section-heading' },
    el('h3', { text: title }),
    el('span', { className: 'resource-count', text: String(resources.length) }),
  ));
  const list = el('div', { className: 'resource-list' });
  for (const resource of resources) list.append(resourceRow(resource, target, onSubResource));
  if (!resources.length) list.append(el('div', { className: 'empty-state compact', text: 'None.' }));
  section.append(list);
  return section;
}

export function renderResources(container, document, target, onSubResource) {
  clear(container);
  container.append(el('div', { className: 'content-heading' },
    el('div', {},
      el('h2', { text: 'Resources' }),
      el('p', { className: 'muted', text: 'External files and embedded resources referenced by this scene.' }),
    ),
  ));

  container.append(
    resourceSection('External', document.externalResources, target, onSubResource),
    resourceSection('Embedded', document.subResources, target, onSubResource),
  );
}
