function parseHeader(line, lineNumber) {
  if (!line.startsWith('[') || !line.endsWith(']')) {
    throw new Error(`Malformed section header at line ${lineNumber}.`);
  }
  const inner = line.slice(1, -1).trim();
  const firstSpace = inner.search(/\s/);
  const kind = firstSpace === -1 ? inner : inner.slice(0, firstSpace);
  const rest = firstSpace === -1 ? '' : inner.slice(firstSpace + 1);
  const attributes = {};
  const attributeOrder = [];

  let i = 0;
  while (i < rest.length) {
    while (/\s/.test(rest[i] ?? '')) i++;
    if (i >= rest.length) break;

    const keyStart = i;
    while (i < rest.length && rest[i] !== '=' && !/\s/.test(rest[i])) i++;
    const key = rest.slice(keyStart, i);
    while (/\s/.test(rest[i] ?? '')) i++;
    if (rest[i] !== '=') throw new Error(`Malformed attribute in ${kind} at line ${lineNumber}.`);
    i++;
    while (/\s/.test(rest[i] ?? '')) i++;

    let value = '';
    if (rest[i] === '"') {
      const start = i;
      i++;
      let escaped = false;
      while (i < rest.length) {
        const ch = rest[i++];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '"') break;
      }
      value = rest.slice(start, i);
    } else {
      const start = i;
      while (i < rest.length && !/\s/.test(rest[i])) i++;
      value = rest.slice(start, i);
    }
    const normalized = /^"(?:\\.|[^"\\])*"$/s.test(value)
      ? (() => { try { return JSON.parse(value); } catch { return value.slice(1, -1); } })()
      : value;
    attributes[key] = normalized;
    attributeOrder.push({ key, value: normalized, raw: value });
  }

  return { kind, attributes, attributeOrder, properties: [], line: lineNumber };
}

function balanceState(text) {
  let round = 0;
  let square = 0;
  let curly = 0;
  let quoted = false;
  let escaped = false;

  for (const ch of text) {
    if (quoted) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') quoted = false;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === '(') round++;
    else if (ch === ')') round--;
    else if (ch === '[') square++;
    else if (ch === ']') square--;
    else if (ch === '{') curly++;
    else if (ch === '}') curly--;
  }
  return { round, square, curly, quoted };
}

function isBalanced(text) {
  const state = balanceState(text);
  return state.round === 0 && state.square === 0 && state.curly === 0 && !state.quoted;
}

export function parseTscn(source) {
  if (typeof source !== 'string') throw new TypeError('TSCN source must be a string.');
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const document = {
    header: null,
    externalResources: [],
    subResources: [],
    nodes: [],
    connections: [],
    unknownSections: [],
    sections: [],
  };

  let current = null;
  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    const lineNumber = i + 1;
    i++;

    if (!trimmed || trimmed.startsWith(';')) continue;
    if (trimmed.startsWith('[')) {
      current = parseHeader(trimmed, lineNumber);
      document.sections.push(current);
      if (current.kind === 'gd_scene' && !document.header) document.header = current;
      else if (current.kind === 'ext_resource') document.externalResources.push(current);
      else if (current.kind === 'sub_resource') document.subResources.push(current);
      else if (current.kind === 'node') document.nodes.push(current);
      else if (current.kind === 'connection') document.connections.push(current);
      else if (current.kind !== 'gd_scene') document.unknownSections.push(current);
      continue;
    }

    if (!current) throw new Error(`Property found before any section at line ${lineNumber}.`);
    const equals = rawLine.indexOf('=');
    if (equals === -1) throw new Error(`Expected key = value at line ${lineNumber}.`);
    const key = rawLine.slice(0, equals).trim();
    let value = rawLine.slice(equals + 1).trim();
    const startLine = lineNumber;

    while (!isBalanced(value)) {
      if (i >= lines.length) throw new Error(`Unterminated value starting at line ${startLine}.`);
      value += `\n${lines[i]}`;
      i++;
    }
    const state = balanceState(value);
    if (state.round < 0 || state.square < 0 || state.curly < 0) {
      throw new Error(`Unbalanced value at line ${startLine}.`);
    }

    current.properties.push({ key, value, line: startLine });
  }

  if (!document.header) throw new Error('Missing [gd_scene] header.');
  return document;
}
