import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api.js';
import { Spinner, ErrorMsg, ReloadBtn } from './ui.jsx';

// Minimal syntax highlighter — returns array of {text, cls} spans
function tokenizeLine(line) {
  const spans = [];

  // Full-line comment
  if (/^\s*#/.test(line)) {
    spans.push({ text: line, cls: 'cm' });
    return spans;
  }

  // Section open / close
  if (/^\s*[\w:.\-]+\s*\{/.test(line)) {
    const m = line.match(/^(\s*)([\w:.\-]+)(\s*\{.*)$/);
    if (m) {
      spans.push({ text: m[1], cls: '' });
      spans.push({ text: m[2], cls: 'cs' }); // section name
      spans.push({ text: m[3], cls: 'cp' }); // brace
    } else {
      spans.push({ text: line, cls: '' });
    }
    return spans;
  }
  if (/^\s*\}/.test(line)) {
    spans.push({ text: line, cls: 'cp' });
    return spans;
  }

  // Assignment: key = value  # comment
  const eqIdx = line.indexOf('=');
  if (eqIdx > 0) {
    const indent = line.match(/^(\s*)/)[1];
    const rest   = line.slice(indent.length);
    const key    = rest.slice(0, eqIdx - indent.length === 0 ? eqIdx : eqIdx - indent.length).trimEnd();
    // re-find in trimmed
    const trimmed = line.trim();
    const teq = trimmed.indexOf('=');
    const tkey = trimmed.slice(0, teq).trimEnd();
    const trest = trimmed.slice(teq + 1).trim();
    const hashIdx = trest.search(/\s+#/);
    const tval = hashIdx >= 0 ? trest.slice(0, hashIdx).trim() : trest;
    const tcom = hashIdx >= 0 ? trest.slice(hashIdx).trim() : '';

    spans.push({ text: indent, cls: '' });
    // colour $vars differently in key
    if (tkey.startsWith('$')) {
      spans.push({ text: tkey, cls: 'cv' });
    } else {
      spans.push({ text: tkey, cls: 'ck' });
    }
    spans.push({ text: ' = ', cls: 'cp' });

    // value — highlight $vars inline
    if (tval.includes('$')) {
      let remaining = tval;
      const varRe = /\$[\w]+/g;
      let m, last = 0;
      while ((m = varRe.exec(tval)) !== null) {
        if (m.index > last) spans.push({ text: tval.slice(last, m.index), cls: 'cval' });
        spans.push({ text: m[0], cls: 'cv' });
        last = m.index + m[0].length;
      }
      if (last < tval.length) spans.push({ text: tval.slice(last), cls: 'cval' });
    } else {
      spans.push({ text: tval, cls: 'cval' });
    }

    if (tcom) {
      spans.push({ text: ' ' + tcom, cls: 'cm' });
    }
    return spans;
  }

  spans.push({ text: line, cls: '' });
  return spans;
}

const CLS = {
  cm:   '#6c7086',   // comment
  cs:   '#89b4fa',   // section name
  cp:   '#cba6f7',   // punctuation / brace / equals
  ck:   '#89dceb',   // key
  cv:   '#f9e2af',   // $variable
  cval: '#a6e3a1',   // value
  '':   '#cdd6f4',   // default
};

function HighlightedLine({ line, lineNo }) {
  const spans = tokenizeLine(line);
  return (
    <div style={{ display: 'flex', lineHeight: '20px', minHeight: 20 }}>
      <span style={{
        minWidth: 42, textAlign: 'right', paddingRight: 14,
        color: '#45475a', fontSize: 11, fontFamily: 'var(--mono)',
        userSelect: 'none', flexShrink: 0,
      }}>{lineNo}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, whiteSpace: 'pre', flex: 1, overflow: 'hidden' }}>
        {spans.map((s, i) => (
          <span key={i} style={{ color: CLS[s.cls] || CLS[''] }}>{s.text}</span>
        ))}
      </span>
    </div>
  );
}

export default function RawViewer() {
  const [files, setFiles]         = useState([]);
  const [selected, setSelected]   = useState(null);
  const [content, setContent]     = useState('');
  const [loadingFiles, setLF]     = useState(true);
  const [loadingContent, setLC]   = useState(false);
  const [error, setError]         = useState(null);
  const [lineFilter, setLineFilter] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    api.getFiles()
      .then(r => {
        setFiles(r.files);
        if (r.files.length > 0) setSelected(r.files[0]);
      })
      .catch(e => setError(e.message))
      .finally(() => setLF(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLC(true);
    setContent('');
    api.getFile(selected.path)
      .then(r => setContent(r.content))
      .catch(e => setError(e.message))
      .finally(() => setLC(false));
  }, [selected]);

  const lines = content.split('\n');
  const displayLines = lineFilter
    ? lines
        .map((l, i) => ({ l, i: i + 1 }))
        .filter(({ l }) => l.toLowerCase().includes(lineFilter.toLowerCase()))
    : lines.map((l, i) => ({ l, i: i + 1 }));

  const fmt = n => {
    if (n < 1024) return n + ' B';
    return (n / 1024).toFixed(1) + ' KB';
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 130px)', gap: 0 }}>

      {/* File list sidebar */}
      <div style={{
        width: 180, flexShrink: 0, borderRight: '1px solid var(--border)',
        overflowY: 'auto', paddingTop: 4,
      }}>
        {loadingFiles
          ? <Spinner />
          : files.length === 0
          ? <div style={{ padding: 16, color: 'var(--text3)', fontSize: 12 }}>No .conf files found</div>
          : files.map(f => (
            <button key={f.path} onClick={() => setSelected(f)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 12px', border: 'none', cursor: 'pointer',
                background: selected?.path === f.path ? 'var(--accent-bg)' : 'transparent',
                color: selected?.path === f.path ? 'var(--accent)' : 'var(--text2)',
                borderLeft: `2px solid ${selected?.path === f.path ? 'var(--accent)' : 'transparent'}`,
                fontSize: 12, fontFamily: 'var(--mono)',
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{fmt(f.size)}</div>
            </button>
          ))
        }
      </div>

      {/* Content panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selected && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 14px', borderBottom: '1px solid var(--border)',
            background: 'var(--s1)', flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--accent-soft)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selected.path}
            </span>
            <input
              value={lineFilter} onChange={e => setLineFilter(e.target.value)}
              placeholder="filter lines…"
              style={{
                background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 5,
                padding: '3px 9px', color: 'var(--text1)', fontSize: 11, outline: 'none', width: 140,
              }}
            />
            {lineFilter && (
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{displayLines.length} lines</span>
            )}
            <ReloadBtn onClick={() => { delete window.__rawCache; setSelected({ ...selected }); }} />
          </div>
        )}

        {error && <ErrorMsg msg={error} />}

        {loadingContent
          ? <Spinner />
          : (
            <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0', background: 'var(--bg)' }}>
              {displayLines.map(({ l, i }) => (
                <HighlightedLine key={i} line={l} lineNo={i} />
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}
