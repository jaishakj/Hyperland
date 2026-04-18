import { useState, useEffect } from 'react';
import { api } from './lib/api.js';
import GeneralSection    from './components/GeneralSection.jsx';
import AnimationsSection from './components/AnimationsSection.jsx';
import BindsSection      from './components/BindsSection.jsx';
import LookFeelSection   from './components/LookFeelSection.jsx';
import VariablesSection  from './components/VariablesSection.jsx';
import SearchSection     from './components/SearchSection.jsx';
import RawViewer         from './components/RawViewer.jsx';

const TABS = [
  { id: 'general',     label: 'General',     icon: '⊞', group: 'Config' },
  { id: 'lookandfeel', label: 'Look & Feel',  icon: '◈', group: 'Config' },
  { id: 'animations',  label: 'Animations',  icon: '◎', group: 'Config' },
  { id: 'binds',       label: 'Binds',        icon: '⌨', group: 'Config' },
  { id: 'variables',   label: 'Variables',   icon: '$', group: 'Config' },
  { id: 'search',      label: 'Search',      icon: '⌕', group: 'Tools' },
  { id: 'raw',         label: 'Raw Files',   icon: '≡', group: 'Tools' },
];

const GROUPS = ['Config', 'Tools'];

export default function App() {
  const [active, setActive] = useState('general');
  const [info, setInfo]     = useState(null);
  const [apiOk, setApiOk]   = useState(null);
  const [clock, setClock]   = useState('');

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    api.info()
      .then(r => { setInfo(r); setApiOk(true); })
      .catch(() => setApiOk(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text1)', fontFamily: 'var(--sans)' }}>

      {/* Titlebar */}
      <div style={{
        height: 44, background: 'var(--s0)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12,
        userSelect: 'none', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <span style={{ color: 'var(--accent)', fontSize: 17 }}>✦</span>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: .4 }}>HyprSettings</span>
        <span style={{
          fontSize: 10, padding: '1px 7px', borderRadius: 4,
          background: 'var(--s3)', color: 'var(--text3)', border: '1px solid var(--border)',
        }}>read-only</span>

        <div style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 4,
          background: apiOk === null ? 'var(--s3)' : apiOk ? 'rgba(74,222,128,.1)' : 'rgba(248,113,113,.1)',
          color:      apiOk === null ? 'var(--text3)' : apiOk ? '#4ade80' : '#f87171',
          border:     '1px solid ' + (apiOk === null ? 'var(--border)' : apiOk ? 'rgba(74,222,128,.3)' : 'rgba(248,113,113,.3)'),
        }}>
          {apiOk === null ? 'connecting…' : apiOk ? '● connected' : '✕ API offline'}
        </div>

        {info && (
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            {info.hypr_dir}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{clock}</span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{
          width: 196, background: 'var(--s0)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', padding: '12px 8px',
          position: 'sticky', top: 44, height: 'calc(100vh - 44px)', overflowY: 'auto',
          flexShrink: 0,
        }}>
          {GROUPS.map(group => (
            <div key={group} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 9, color: 'var(--text3)', padding: '0 8px 6px',
                textTransform: 'uppercase', letterSpacing: 1.3,
              }}>{group}</div>
              {TABS.filter(t => t.group === group).map(tab => (
                <button key={tab.id} onClick={() => setActive(tab.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 10px', borderRadius: 7, cursor: 'pointer', marginBottom: 2,
                  background: active === tab.id ? 'var(--accent-bg)' : 'transparent',
                  color:      active === tab.id ? 'var(--accent)' : 'var(--text2)',
                  border: 'none',
                  borderLeft: '2px solid ' + (active === tab.id ? 'var(--accent)' : 'transparent'),
                  fontSize: 13, textAlign: 'left', width: '100%',
                  transition: 'all .12s', fontFamily: 'var(--sans)',
                }}>
                  <span style={{ fontSize: tab.id === 'variables' ? 13 : 15, fontFamily: tab.id === 'variables' ? 'var(--mono)' : 'inherit', opacity: .8, fontWeight: tab.id === 'variables' ? 700 : 400 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          ))}

          {/* Sourced files */}
          {info?.sources?.length > 0 && (
            <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, padding: '0 4px' }}>Sourced</div>
              {info.sources.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 4px' }}>
                  <span style={{ fontSize: 8, color: s.exists ? '#4ade80' : '#f87171' }}>●</span>
                  <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={s.resolved}>{s.raw.split('/').pop()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Config file health */}
          {info && (
            <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)', marginTop: info?.sources?.length > 0 ? 10 : 'auto' }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, padding: '0 4px' }}>Files</div>
              {Object.entries(info.files).map(([name, f]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 4px' }}>
                  <span style={{ fontSize: 8, color: f.exists ? '#4ade80' : '#f87171' }}>●</span>
                  <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{name}.conf</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{
          flex: 1, overflowY: active === 'raw' ? 'hidden' : 'auto',
          padding: active === 'raw' ? '0' : '20px 28px',
          maxWidth: active === 'raw' ? 'none' : 840,
        }}>
          {active !== 'raw' && (
            <h1 style={{ margin: '0 0 18px', fontSize: 22, fontWeight: 700, letterSpacing: -.3 }}>
              {TABS.find(t => t.id === active)?.label}
            </h1>
          )}

          {apiOk === false && (
            <div style={{
              margin: active === 'raw' ? 16 : 0,
              padding: '12px 16px', borderRadius: 8, marginBottom: 16,
              background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.25)',
              color: '#f87171', fontSize: 13, lineHeight: 1.7,
            }}>
              Backend is offline. Start it with:{' '}
              <code style={{ fontFamily: 'var(--mono)', background: 'rgba(0,0,0,.4)', padding: '1px 7px', borderRadius: 4 }}>
                node server/index.js
              </code>
            </div>
          )}

          {active === 'general'     && <GeneralSection />}
          {active === 'lookandfeel' && <LookFeelSection />}
          {active === 'animations'  && <AnimationsSection />}
          {active === 'binds'       && <BindsSection />}
          {active === 'variables'   && <VariablesSection />}
          {active === 'search'      && <SearchSection />}
          {active === 'raw'         && <RawViewer />}
        </div>
      </div>
    </div>
  );
}
