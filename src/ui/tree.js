import { el, clear } from './dom.js';

export function renderSceneTree(container, tree, onSelect) {
  clear(container);
  if (!tree.root) {
    container.append(el('div', { className: 'empty-state', text: 'This scene has no node declarations.' }));
    return;
  }

  function renderNode(treeNode, depth = 0) {
    const decl = treeNode.declaration;
    const row = el('button', {
      type: 'button',
      className: 'tree-row',
      'aria-label': `Select ${decl.attributes.name}`,
    });
    row.style.setProperty('--depth', depth);
    row.append(
      el('span', { className: 'tree-chevron', text: treeNode.children.length ? '▾' : '·' }),
      el('span', { className: 'node-icon', text: '◇' }),
      el('span', { className: 'node-name', text: decl.attributes.name ?? '(unnamed)' }),
    );
    if (decl.attributes.type) row.append(el('span', { className: 'node-type', text: decl.attributes.type }));
    if (decl.attributes.instance) row.append(el('span', { className: 'badge', text: 'instance' }));
    row.addEventListener('click', () => {
      container.querySelectorAll('.tree-row.selected').forEach((item) => item.classList.remove('selected'));
      row.classList.add('selected');
      onSelect(decl);
    });
    container.append(row);
    for (const child of treeNode.children) renderNode(child, depth + 1);
  }

  renderNode(tree.root);
  if (tree.unresolved.length) {
    container.append(el('div', { className: 'tree-group-title', text: `Unresolved (${tree.unresolved.length})` }));
    for (const item of tree.unresolved) renderNode(item, 0);
  }

  const first = container.querySelector('.tree-row');
  if (first) first.click();
}
