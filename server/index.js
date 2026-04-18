const express  = require('express');
const cors     = require('cors');
const fs       = require('fs');
const path     = require('path');
const os       = require('os');
const chokidar = require('chokidar');
const { tokenize, extractVariables, resolveVars, getSection } = require('./parser');

const app = express();
app.use(cors());

// ── Config dir ────────────────────────────────────────────────────────────────

const HYPR_DIR = process.env.HYPR_DIR || path.join(os.homedir(), '.config', 'hypr');

const CONFIG_FILES = {
  main:        path.join(HYPR_DIR, 'hyprland.conf'),
  animations:  path.join(HYPR_DIR, 'animations.conf'),
  binds:       path.join(HYPR_DIR, 'binds.conf'),
  keybindings: path.join(HYPR_DIR, 'keybindings.conf'),
};

function firstExisting(...names) {
  for (const n of names) {
    const fp = path.isAbsolute(n) ? n : path.join(HYPR_DIR, n);
    if (fs.existsSync(fp)) return fp;
  }
  return null;
}

// ── File cache ────────────────────────────────────────────────────────────────

const cache = {};

function read(fp) {
  if (!fp || !fs.existsSync(fp)) return '';
  if (!cache[fp]) cache[fp] = fs.readFileSync(fp, 'utf8');
  return cache[fp];
}

if (fs.existsSync(HYPR_DIR)) {
  chokidar.watch(HYPR_DIR, { ignoreInitial: true }).on('change', f => {
    delete cache[f];
    console.log('[watch] invalidated', path.basename(f));
  });
}

// ── Core: build full merged token list + variable map ────────────────────────

/**
 * Returns { tokens, vars }
 * - tokens: merged from hyprland.conf + all sourced sub-files (1 level)
 * - vars: Map of $name -> resolved value
 */
function buildAll() {
  const mainText = read(CONFIG_FILES.main);
  const mainTokens = tokenize(mainText);

  // Expand source directives
  const allTokens = [...mainTokens];
  for (const t of mainTokens) {
    if (t.type !== 'assignment' || t.key !== 'source') continue;
    const raw = t.value
      .replace(/^~\//, os.homedir() + '/')
      .replace(/^\$HOME\//, os.homedir() + '/');
    const resolved = path.isAbsolute(raw) ? raw : path.join(HYPR_DIR, raw);
    if (fs.existsSync(resolved)) {
      allTokens.push(...tokenize(read(resolved)));
    }
  }

  // Build variable map from ALL tokens so cross-file $vars work
  const vars = extractVariables(allTokens);

  return { tokens: allTokens, vars };
}

// ── Value helper: resolve vars in a section result ───────────────────────────

function v(sectionObj, key, vars, fallback = '') {
  const raw = sectionObj[key]?.value ?? fallback;
  return resolveVars(raw, vars);
}

// ── Extractors ────────────────────────────────────────────────────────────────

function extractGeneral() {
  const { tokens, vars } = buildAll();
  const gen     = getSection(tokens, ['general']);
  const dec     = getSection(tokens, ['decoration']);
  const blur    = getSection(tokens, ['decoration', 'blur']);
  const misc    = getSection(tokens, ['misc']);
  const dwindle = getSection(tokens, ['dwindle']);
  const input   = getSection(tokens, ['input']);

  // Helper that also gives back the raw (pre-resolution) value
  const field = (sec, key, fallback = '') => {
    const raw = sec[key]?.value ?? fallback;
    const resolved = resolveVars(raw, vars);
    return resolved;
  };

  return {
    gaps_in:              field(gen,  'gaps_in',            '5'),
    gaps_out:             field(gen,  'gaps_out',           '10'),
    border_size:          field(gen,  'border_size',        '2'),
    col_active_border:    field(gen,  'col.active_border',  'rgba(33ccffee) rgba(00ff99ee) 45deg'),
    col_inactive_border:  field(gen,  'col.inactive_border','rgba(595959aa)'),
    layout:               field(gen,  'layout',             'dwindle'),
    allow_tearing:        field(gen,  'allow_tearing',      'false'),
    rounding:             field(dec,  'rounding',           '10'),
    active_opacity:       field(dec,  'active_opacity',     '1.0'),
    inactive_opacity:     field(dec,  'inactive_opacity',   '1.0'),
    drop_shadow:          field(dec,  'drop_shadow',        'yes'),
    shadow_range:         field(dec,  'shadow_range',       '4'),
    shadow_render_power:  field(dec,  'shadow_render_power','3'),
    col_shadow:           field(dec,  'col.shadow',         'rgba(1a1a1aee)'),
    blur_enabled:         field(blur, 'enabled',            'yes'),
    blur_size:            field(blur, 'size',               '3'),
    blur_passes:          field(blur, 'passes',             '1'),
    blur_noise:           field(blur, 'noise',              '0.0117'),
    blur_contrast:        field(blur, 'contrast',           '0.8916'),
    blur_brightness:      field(blur, 'brightness',         '0.8172'),
    disable_hyprland_logo:   field(misc, 'disable_hyprland_logo',   'false'),
    enable_swallow:          field(misc, 'enable_swallow',          'false'),
    force_default_wallpaper: field(misc, 'force_default_wallpaper', '-1'),
    pseudotile:     field(dwindle, 'pseudotile',     'true'),
    preserve_split: field(dwindle, 'preserve_split', 'true'),
    kb_layout:    field(input, 'kb_layout',   'us'),
    sensitivity:  field(input, 'sensitivity',  '0'),
    follow_mouse: field(input, 'follow_mouse', '1'),
  };
}

function extractVariablesList() {
  const { tokens, vars } = buildAll();
  const result = [];
  for (const t of tokens) {
    if (t.type === 'assignment' && t.key.startsWith('$')) {
      result.push({
        name: t.key,
        raw: t.value,
        resolved: resolveVars(t.value, vars),
      });
    }
  }
  return result;
}

function extractAnimations() {
  const animFp = firstExisting('animations.conf') || CONFIG_FILES.main;
  const { vars } = buildAll();
  const tokens = tokenize(read(animFp));
  const beziers = [], animations = [];

  for (const t of tokens) {
    if (t.type !== 'assignment') continue;
    if (t.key === 'bezier') {
      const p = t.value.split(',').map(s => s.trim());
      beziers.push({ name: p[0], x0: p[1]??'0', y0: p[2]??'0', x1: p[3]??'1', y1: p[4]??'1' });
    }
    if (t.key === 'animation') {
      const p = t.value.split(',').map(s => s.trim());
      animations.push({
        name: p[0], enabled: p[1]==='1', speed: p[2]??'1',
        curve: p[3]??'default', style: p[4]??'',
      });
    }
  }

  return { beziers, animations, source: animFp };
}

function extractBinds() {
  const bindFp = firstExisting('binds.conf', 'keybindings.conf') || CONFIG_FILES.main;
  const BIND_KEYS = new Set(['bind','binde','bindm','bindr','bindl']);
  const tokens = tokenize(read(bindFp));
  const binds = [];

  for (const t of tokens) {
    if (t.type !== 'assignment' || !BIND_KEYS.has(t.key)) continue;
    const p = t.value.split(',').map(s => s.trim());
    binds.push({
      type: t.key, mod: p[0]??'', key: p[1]??'',
      dispatcher: p[2]??'', args: p.slice(3).join(', '),
      comment: t.inline_comment?.replace(/^#\s*/,'') ?? '',
    });
  }

  return { binds, source: bindFp };
}

function extractSources() {
  const mainText = read(CONFIG_FILES.main);
  const tokens = tokenize(mainText);
  const sources = [];
  for (const t of tokens) {
    if (t.type === 'assignment' && t.key === 'source') {
      const raw = t.value;
      const resolved = raw
        .replace(/^~\//, os.homedir() + '/')
        .replace(/^\$HOME\//, os.homedir() + '/');
      const abs = path.isAbsolute(resolved) ? resolved : path.join(HYPR_DIR, resolved);
      sources.push({ raw, resolved: abs, exists: fs.existsSync(abs) });
    }
  }
  return sources;
}

/**
 * Search across all merged tokens.
 * Returns matching assignments with file context.
 */
function searchTokens(query) {
  const q = query.toLowerCase();
  const { tokens } = buildAll();
  const results = [];

  for (const t of tokens) {
    if (t.type !== 'assignment') continue;
    const haystack = [t.key, t.value, t.inline_comment ?? ''].join(' ').toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        key: t.key,
        value: t.value,
        section: t.section,
        comment: t.inline_comment?.replace(/^#\s*/,'') ?? '',
        raw: t.raw,
      });
    }
  }

  return results;
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/api/info', (req, res) => {
  res.json({
    ok: true, hypr_dir: HYPR_DIR,
    files: Object.fromEntries(
      Object.entries(CONFIG_FILES).map(([k,v]) => [k, { path: v, exists: fs.existsSync(v) }])
    ),
    sources: extractSources(),
  });
});

app.get('/api/general',    (req, res) => {
  try { res.json({ ok: true, data: extractGeneral() }); }
  catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/animations', (req, res) => {
  try { res.json({ ok: true, data: extractAnimations() }); }
  catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/binds', (req, res) => {
  try { res.json({ ok: true, data: extractBinds() }); }
  catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/variables', (req, res) => {
  try { res.json({ ok: true, data: extractVariablesList() }); }
  catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// GET /api/search?q=keyword
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) return res.json({ ok: true, results: [] });
  try { res.json({ ok: true, results: searchTokens(q), query: q }); }
  catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/raw/:file', (req, res) => {
  const allowed = ['main','animations','binds','keybindings'];
  if (!allowed.includes(req.params.file)) return res.status(400).json({ ok: false, error: 'unknown file' });
  const fp = CONFIG_FILES[req.params.file];
  res.json({ ok: true, content: read(fp), path: fp, exists: fs.existsSync(fp) });
});

// List all .conf files in HYPR_DIR for the raw viewer
app.get('/api/files', (req, res) => {
  try {
    if (!fs.existsSync(HYPR_DIR)) return res.json({ ok: true, files: [] });
    const files = fs.readdirSync(HYPR_DIR)
      .filter(f => f.endsWith('.conf'))
      .map(f => {
        const fp = path.join(HYPR_DIR, f);
        const stat = fs.statSync(fp);
        return { name: f, path: fp, size: stat.size, mtime: stat.mtime };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    res.json({ ok: true, files });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// GET /api/file?path=/abs/path/to/foo.conf  — arbitrary file in HYPR_DIR only
app.get('/api/file', (req, res) => {
  const fp = req.query.path;
  if (!fp || !fp.startsWith(HYPR_DIR)) return res.status(403).json({ ok: false, error: 'path not allowed' });
  if (!fs.existsSync(fp)) return res.status(404).json({ ok: false, error: 'not found' });
  res.json({ ok: true, content: read(fp), path: fp });
});

const PORT = process.env.PORT || 3847;
app.listen(PORT, () => {
  console.log(`HyprSettings API  →  http://localhost:${PORT}`);
  console.log(`Config dir        →  ${HYPR_DIR}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET /api/info`);
  console.log(`  GET /api/general`);
  console.log(`  GET /api/animations`);
  console.log(`  GET /api/binds`);
  console.log(`  GET /api/variables`);
  console.log(`  GET /api/search?q=<query>`);
  console.log(`  GET /api/files`);
  console.log(`  GET /api/file?path=<abs_path>`);
  console.log(`  GET /api/raw/<main|animations|binds|keybindings>`);
  console.log(`\nOverride dir: HYPR_DIR=/path/to/hypr node server/index.js`);
});

// ── Serve built React app in production ──────────────────────────────────────
// Run `npm run build` from project root first, then just `node server/index.js`

const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distDir, 'index.html'));
    }
  });
  console.log(`\nServing built app from: ${distDir}`);
  console.log(`Open http://localhost:${PORT}`);
}
