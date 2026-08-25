export function el(tag, options = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(options)) {
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('data-')) node.setAttribute(key, value);
    else if (key === 'title') node.title = value;
    else if (key === 'href') node.href = value;
    else if (key === 'target') node.target = value;
    else if (key === 'rel') node.rel = value;
    else if (key === 'type') node.type = value;
    else if (key === 'aria-label') node.setAttribute('aria-label', value);
  }
  for (const child of children.flat()) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function clear(node) {
  node.replaceChildren();
}
