import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api.js';
import { Tag, SectionCard, Spinner } from './ui.jsx';

function ResultRow({ r, idx }) {
  const sectionLabel = r.section.length ? r.section.join(' › ') : '(top level)';
  return (
    <div style={{
      padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)',
      background: idx % 2 === 0 ? 'transparent' : 'var(--s2)',
      display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap',
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#89dceb' }}>{r.key}</span>
          <span style={{ color: 'var(--text3)', fontSize: 11 }}>=</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#a6e3a1', wordBreak: 'break-all' }}>{r.value}</span>
          {r.comment && <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>{r.comment}</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Tag color="dim">{sectionLabel}</Tag>
        </div>
      </div>
      <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', whiteSpace: 'pre', flexShrink: 0 }}>
        {r.raw.trim()}
      </span>
    </div>
  );
}

export default function SearchSection() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const debounce = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    if (query.trim().length < 2) { setResults([]); setSearched(false); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await api.search(query.trim());
        setResults(r.results);
        setSearched(true);
      } catch {}
      finally { setLoading(false); }
    }, 300);
  }, [query]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input
          ref={inputRef}
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search across all config tokens…  e.g. exec, rgba, gaps, SUPER"
          style={{
            width: '100%', padding: '10px 16px',
            background: 'var(--s1)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text1)', fontSize: 14,
            outline: 'none', fontFamily: 'var(--sans)',
            boxShadow: query ? '0 0 0 2px var(--accent-bg)' : 'none',
            transition: 'box-shadow .15s',
          }}
        />
        {query.trim().length > 0 && query.trim().length < 2 && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6, paddingLeft: 4 }}>Type at least 2 characters</div>
        )}
      </div>

      {loading && <Spinner />}

      {!loading && searched && (
        <div style={{ marginBottom: 10, fontSize: 12, color: 'var(--text3)' }}>
          {results.length} result{results.length !== 1 ? 's' : ''} for <span style={{ color: 'var(--accent-soft)', fontFamily: 'var(--mono)' }}>"{query}"</span>
        </div>
      )}

      {!loading && results.length > 0 && (
        <SectionCard>
          {results.map((r, i) => <ResultRow key={i} r={r} idx={i} />)}
        </SectionCard>
      )}

      {!loading && searched && results.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
          No matches for <span style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>"{query}"</span>
        </div>
      )}

      {!searched && !loading && (
        <div style={{ padding: '30px 0', color: 'var(--text3)', fontSize: 13, lineHeight: 2 }}>
          <div style={{ marginBottom: 12 }}>Searches across all merged config tokens including sourced files.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['exec', 'rgba', 'gaps', 'SUPER', 'blur', 'easeOut', 'rounding', 'opacity', 'source', '$primary'].map(s => (
              <button key={s} onClick={() => setQuery(s)}
                style={{
                  padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 12,
                  background: 'var(--s2)', border: '1px solid var(--border)',
                  color: 'var(--text2)', fontFamily: 'var(--mono)',
                }}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
