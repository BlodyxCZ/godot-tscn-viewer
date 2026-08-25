function wrap(declaration, path) {
  return { declaration, path, children: [] };
}

export function buildSceneTree(nodes) {
  const byPath = new Map();
  const unresolved = [];
  if (!Array.isArray(nodes) || nodes.length === 0) return { root: null, unresolved, byPath };

  const rootDecl = nodes.find((node) => node?.attributes && !Object.hasOwn(node.attributes, 'parent')) ?? nodes[0];
  const root = wrap(rootDecl, '');
  byPath.set('', root);

  const pending = nodes
    .filter((node) => node !== rootDecl)
    .map((declaration) => ({ declaration }));

  let progressed = true;
  while (pending.length && progressed) {
    progressed = false;
    for (let i = pending.length - 1; i >= 0; i--) {
      const { declaration } = pending[i];
      const name = declaration?.attributes?.name;
      const parentAttr = declaration?.attributes?.parent;
      if (!name) {
        unresolved.push(wrap(declaration, null));
        pending.splice(i, 1);
        progressed = true;
        continue;
      }

      const parentPath = parentAttr === '.' ? '' : parentAttr;
      const parent = byPath.get(parentPath);
      if (!parent) continue;

      const path = parentPath ? `${parentPath}/${name}` : name;
      const treeNode = wrap(declaration, path);
      parent.children.push(treeNode);
      byPath.set(path, treeNode);
      pending.splice(i, 1);
      progressed = true;
    }
  }

  for (const { declaration } of pending) unresolved.push(wrap(declaration, null));

  const sortChildren = (node) => {
    node.children.sort((a, b) => nodes.indexOf(a.declaration) - nodes.indexOf(b.declaration));
    for (const child of node.children) sortChildren(child);
  };
  sortChildren(root);

  return { root, unresolved, byPath };
}
