import { el, clear } from './dom.js';

export function renderConnections(container, document) {
  clear(container);
  container.append(el('div', { className: 'content-heading' },
    el('div', {}, el('h2', { text: 'Signal connections' }), el('p', { className: 'muted', text: 'Connections declared in the scene file.' })),
  ));
  if (!document.connections.length) {
    container.append(el('div', { className: 'empty-state', text: 'No signal connections declared.' }));
    return;
  }
  const table = el('div', { className: 'connection-table' });
  table.append(el('div', { className: 'connection-row header' }, ...['Signal', 'From', 'To', 'Method'].map((v) => el('div', { text: v }))));
  for (const connection of document.connections) {
    table.append(el('div', { className: 'connection-row' },
      el('div', { text: connection.attributes.signal ?? '' }),
      el('div', { text: connection.attributes.from ?? '' }),
      el('div', { text: connection.attributes.to ?? '' }),
      el('div', { text: connection.attributes.method ?? '' }),
    ));
  }
  container.append(table);
}
