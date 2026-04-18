import { api } from '../lib/api.js';
import { useSection } from '../hooks/useSection.js';
import { SectionCard, ColorSwatch, ReloadBtn, Spinner, ErrorMsg, EmptyState } from './ui.jsx';

function isColor(v) {
  return /rgba?\(|0x[0-9a-f]{6}|#[0-9a-f]{3,8}/i.test(v);
}

function VarRow({ v: variable, idx }) {
  const changed = variable.raw !== variable.resolved;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 14px',
      borderBottom: '1px solid var(--border-subtle)',
      background: idx % 2 === 0 ? 'transparent' : 'var(--s2)',
    }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#f9e2af', minWidth: 160, flexShrink: 0 }}>
        {variable.name}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {changed ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>raw</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{variable.raw}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>→</span>
              {isColor(variable.resolved)
                ? <ColorSwatch value={variable.resolved} />
                : <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#a6e3a1' }}>{variable.resolved}</span>
              }
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {isColor(variable.resolved)
              ? <ColorSwatch value={variable.resolved} />
              : <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#a6e3a1' }}>{variable.resolved}</span>
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default function VariablesSection() {
  const { data, loading, error, reload } = useSection(() => api.getVariables());

  if (loading) return <Spinner />;
  if (error && !data) return <ErrorMsg msg={error} />;

  const vars = data ?? [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>
          {vars.length} variable{vars.length !== 1 ? 's' : ''} defined
        </span>
        <ReloadBtn onClick={reload} />
      </div>

      <SectionCard title="$variables">
        {vars.length === 0
          ? <EmptyState msg="No $variable definitions found. They look like: $primary = rgba(cba6f7ff)" />
          : vars.map((v, i) => <VarRow key={i} v={v} idx={i} />)
        }
      </SectionCard>
    </div>
  );
}
