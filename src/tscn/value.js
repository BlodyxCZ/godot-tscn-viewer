function unquote(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw.slice(1, -1);
  }
}

export function describeValue(rawInput) {
  const raw = rawInput.trim();
  if (raw === 'true' || raw === 'false') {
    return { kind: 'boolean', raw, value: raw === 'true' };
  }
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw)) {
    return { kind: 'number', raw, value: Number(raw) };
  }
  if (/^"(?:\\.|[^"\\])*"$/s.test(raw)) {
    return { kind: 'string', raw, value: unquote(raw) };
  }
  let match = raw.match(/^ExtResource\("([^"]+)"\)$/s);
  if (match) return { kind: 'ext-resource', raw, id: match[1] };
  match = raw.match(/^SubResource\("([^"]+)"\)$/s);
  if (match) return { kind: 'sub-resource', raw, id: match[1] };
  if (/^Vector(?:2|2i|3|3i|4|4i)\(/.test(raw)) return { kind: 'vector', raw };
  if (/^Color\(/.test(raw)) return { kind: 'color', raw };
  return { kind: 'expression', raw };
}
