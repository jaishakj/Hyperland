/**
 * Hyprland .conf parser — read-only
 *
 * Token types:
 *   { type: 'blank' }
 *   { type: 'comment', raw }
 *   { type: 'section_open', name, raw }
 *   { type: 'section_close', raw }
 *   { type: 'assignment', section[], key, value, inline_comment, raw }
 *   { type: 'unknown', raw }
 */
function tokenize(text) {
  const lines = text.split('\n');
  const tokens = [];
  const sectionStack = [];

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (trimmed === '') { tokens.push({ type: 'blank', raw }); continue; }
    if (trimmed.startsWith('#')) { tokens.push({ type: 'comment', raw }); continue; }

    const sectionOpen = trimmed.match(/^([\w:.\-]+)\s*\{(.*)$/);
    if (sectionOpen) {
      sectionStack.push(sectionOpen[1]);
      tokens.push({ type: 'section_open', name: sectionOpen[1], raw });
      continue;
    }

    if (trimmed === '}') {
      sectionStack.pop();
      tokens.push({ type: 'section_close', raw });
      continue;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const rest = trimmed.slice(eqIdx + 1).trim();
      const hashIdx = rest.search(/\s+#/);
      const value = hashIdx >= 0 ? rest.slice(0, hashIdx).trim() : rest;
      const inline = hashIdx >= 0 ? rest.slice(hashIdx).trim() : null;
      tokens.push({ type: 'assignment', section: [...sectionStack], key, value, inline_comment: inline, raw });
      continue;
    }

    tokens.push({ type: 'unknown', raw });
  }

  return tokens;
}

/**
 * Extract all $variable = value definitions from a token list.
 * Returns a Map<string, string>  e.g.  { '$primary': 'rgba(cba6f7ff)', ... }
 * Handles both:
 *   $myVar = value          (top-level, section = [])
 *   $myVar = value          (inside a section — some configs do this)
 */
function extractVariables(tokens) {
  const vars = new Map();
  for (const t of tokens) {
    if (t.type === 'assignment' && t.key.startsWith('$')) {
      vars.set(t.key, t.value);
    }
  }
  return vars;
}

/**
 * Resolve $variable references in a value string.
 * Supports nested references up to 8 levels deep.
 */
function resolveVars(value, vars, depth = 0) {
  if (depth > 8 || !value || !value.includes('$')) return value;
  let result = value;
  for (const [k, v] of vars) {
    // match $VAR not followed by alphanumeric/underscore (word boundary)
    const re = new RegExp('\\' + k + '(?![\\w$])', 'g');
    if (re.test(result)) {
      result = result.replace(re, v);
    }
  }
  // recurse if there are still unresolved vars
  if (result !== value && result.includes('$')) {
    return resolveVars(result, vars, depth + 1);
  }
  return result;
}

function getSection(tokens, sectionPath) {
  const result = {};
  const matchStack = [];
  let inTarget = false;

  for (const t of tokens) {
    if (t.type === 'section_open') {
      matchStack.push(t.name);
      if (JSON.stringify(matchStack) === JSON.stringify(sectionPath)) inTarget = true;
    } else if (t.type === 'section_close') {
      if (inTarget && JSON.stringify(matchStack) === JSON.stringify(sectionPath)) inTarget = false;
      matchStack.pop();
    } else if (t.type === 'assignment' && inTarget && matchStack.length === sectionPath.length) {
      result[t.key] = t;
    }
  }
  return result;
}

module.exports = { tokenize, extractVariables, resolveVars, getSection };
