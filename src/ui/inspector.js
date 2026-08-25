import { describeValue } from '../tscn/value.js';
import { resolveResPath } from '../github.js';
import { el, clear } from './dom.js';

function renderValue(raw, context) {
  const info = describeValue(raw);
  if (info.kind === 'ext-resource') {
    const resource = context.externalResources.get(info.id);
    const path = resource?.attributes?.path;
    const href = path ? resolveResPath(context.target, path) : null;
    if (href) return el('a', { className: 'value-link', href, target: '_blank', rel: 'noopener noreferrer', text: path });
  }
  if (info.kind === 'sub-resource') {
    const button = el('button', { className: 'value-link button-link', type: 'button', text: info.id });
    button.addEventListener('click', () => context.onSubResource?.(info.id));
    return button;
  }
  const className = ['boolean', 'number', 'vector', 'color'].includes(info.kind) ? `value-chip ${info.kind}` : 'raw-value';
  return el('span', { className, text: info.kind === 'string' ? info.value : raw });
}

function row(key, valueNode) {
  return el('div', { className: 'property-row' },
    el('div', { className: 'property-key', text: key }),
    el('div', { className: 'property-value' }, valueNode),
  );
}

export function renderInspector(container, section, context) {
  clear(container);
  if (!section) {
    container.append(el('div', { className: 'empty-state', text: 'Select a node.' }));
    return;
  }

  container.append(el('div', { className: 'inspector-title' },
    el('strong', { text: section.attributes.name ?? section.attributes.id ?? section.kind }),
    section.attributes.type ? el('span', { className: 'badge', text: section.attributes.type }) : null,
  ));

  if (section.attributeOrder?.length) {
    container.append(el('div', { className: 'section-title', text: 'Declaration' }));
    for (const attr of section.attributeOrder) container.append(row(attr.key, el('span', { className: 'raw-value', text: String(attr.value) })));
  }

  container.append(el('div', { className: 'section-title', text: 'Properties' }));
  if (!section.properties.length) {
    container.append(el('div', { className: 'empty-state compact', text: 'No properties.' }));
  } else {
    for (const prop of section.properties) container.append(row(prop.key, renderValue(prop.value, context)));
  }
}
