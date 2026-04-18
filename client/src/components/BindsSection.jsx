import { useState } from 'react';
import { api } from '../lib/api.js';
import { useSection } from '../hooks/useSection.js';
import { SectionCard, Kbd, Tag, Spinner, ErrorMsg, EmptyState, ReloadBtn } from './ui.jsx';

const DISPATCHER_COLORS = {
  exec: 'green', killactive: 'red', workspace: 'blue', movetoworkspace: 'blue',
  movetoworkspacesilent: 'blue', fullscreen: 'purple', togglefloating: 'purple',
  togglesplit: 'dim', pseudo: 'dim', exit: 'red', pin: 'purple',
};

function BindRow({ bind, idx }) {
  const color = DISPATCHER_COLORS[bind.dispatcher] || 'dim';
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'7px 14px',
      borderBottom:'1px solid var(--border-subtle)',
      background: idx % 2 === 0 ? 'transparent' : 'var(--s2)',
      flexWrap:'wrap',
    }}>
      {/* bind type */}
      <span style={{
        fontSize:10, padding:'1px 5px', borderRadius:3, fontFamily:'var(--mono)',
        background:'var(--s3)', color:'var(--text3)', border:'1px solid var(--border)',
        flexShrink:0,
      }}>{bind.type}</span>

      {/* modifier + key */}
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        {bind.mod && <Kbd>{bind.mod}</Kbd>}
        {bind.mod && bind.key && <span style={{ color:'var(--text3)', fontSize:11 }}>+</span>}
        {bind.key && <Kbd>{bind.key}</Kbd>}
      </div>

      {/* arrow */}
      <span style={{ color:'var(--text3)', fontSize:12 }}>→</span>

      {/* dispatcher */}
      <Tag color={color}>{bind.dispatcher}</Tag>

      {/* args */}
      {bind.args && (
        <span style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--text2)' }}>{bind.args}</span>
      )}

      {/* comment */}
      {bind.comment && (
        <span style={{ marginLeft:'auto', fontSize:11, color:'var(--text3)', fontStyle:'italic' }}>
          {bind.comment}
        </span>
      )}
    </div>
  );
}

export default function BindsSection() {
  const { data, loading, error, reload } = useSection(() => api.getBinds());
  const [search, setSearch] = useState('');
  const [filterDispatcher, setFilterDispatcher] = useState('');

  if (loading) return <Spinner />;
  if (error && !data) return <ErrorMsg msg={error} />;

  const { binds = [], source } = data;

  // Unique dispatchers for filter pill
  const dispatchers = [...new Set(binds.map(b => b.dispatcher))].sort();

  const filtered = binds.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || [b.mod, b.key, b.dispatcher, b.args, b.comment].some(v => v?.toLowerCase().includes(q));
    const matchDisp = !filterDispatcher || b.dispatcher === filterDispatcher;
    return matchSearch && matchDisp;
  });

  // Group by mod for display
  const groups = {};
  for (const b of filtered) {
    const g = b.mod || '(no modifier)';
    if (!groups[g]) groups[g] = [];
    groups[g].push(b);
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>{source}</span>
        <ReloadBtn onClick={reload} />
      </div>

      {/* Filter bar */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search binds…"
          style={{
            flex:1, minWidth:160, background:'var(--s1)', border:'1px solid var(--border)',
            borderRadius:7, padding:'7px 12px', color:'var(--text1)', fontSize:12,
            outline:'none', fontFamily:'var(--sans)',
          }}
        />
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          <button
            onClick={() => setFilterDispatcher('')}
            style={{
              padding:'4px 10px', borderRadius:5, fontSize:11, cursor:'pointer', border:'1px solid var(--border)',
              background: !filterDispatcher ? 'var(--accent-bg)' : 'var(--s2)',
              color: !filterDispatcher ? 'var(--accent)' : 'var(--text3)',
            }}
          >All</button>
          {dispatchers.slice(0,8).map(d => (
            <button key={d}
              onClick={() => setFilterDispatcher(filterDispatcher === d ? '' : d)}
              style={{
                padding:'4px 10px', borderRadius:5, fontSize:11, cursor:'pointer', border:'1px solid var(--border)',
                background: filterDispatcher === d ? 'var(--accent-bg)' : 'var(--s2)',
                color: filterDispatcher === d ? 'var(--accent)' : 'var(--text3)',
                fontFamily:'var(--mono)',
              }}
            >{d}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:8, fontSize:12, color:'var(--text3)' }}>
        {filtered.length} bind{filtered.length !== 1 ? 's' : ''} {search || filterDispatcher ? '(filtered)' : ''}
      </div>

      {filtered.length === 0
        ? <EmptyState msg={binds.length === 0 ? 'No binds found. Check your binds.conf or keybindings.conf.' : 'No matches for current filter.'} />
        : Object.entries(groups).map(([mod, modBinds]) => (
          <SectionCard key={mod} title={mod}>
            {modBinds.map((b, i) => (
              <BindRow key={i} bind={b} idx={i} />
            ))}
          </SectionCard>
        ))
      }
    </div>
  );
}
