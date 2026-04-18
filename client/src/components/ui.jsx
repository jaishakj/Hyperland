import { useState } from 'react';

export function Row({ label, hint, mono, children }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)',
        background: hov ? 'var(--s2)' : 'transparent', transition: 'background .1s',
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text1)' }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{hint}</div>}
      </div>
      <div style={{ flexShrink: 0, fontFamily: mono ? 'var(--mono)' : 'inherit' }}>{children}</div>
    </div>
  );
}

export function SectionCard({ title, children }) {
  return (
    <div style={{
      background: 'var(--s1)', border: '1px solid var(--border)',
      borderRadius: 10, marginBottom: 14, overflow: 'hidden',
    }}>
      {title && (
        <div style={{
          padding: '8px 14px', fontSize: 10, fontWeight: 700, color: 'var(--text3)',
          textTransform: 'uppercase', letterSpacing: 1.2,
          borderBottom: '1px solid var(--border)',
          background: 'var(--s2)',
        }}>{title}</div>
      )}
      {children}
    </div>
  );
}

export function Value({ children, accent, dim }) {
  return (
    <span style={{
      fontSize: 12, fontFamily: 'var(--mono)',
      color: dim ? 'var(--text3)' : accent ? 'var(--accent-soft)' : 'var(--text2)',
    }}>{children}</span>
  );
}

export function Tag({ children, color }) {
  const colors = {
    green:  ['rgba(74,222,128,.12)', 'rgba(74,222,128,.35)', '#4ade80'],
    red:    ['rgba(248,113,113,.12)', 'rgba(248,113,113,.35)', '#f87171'],
    purple: ['var(--accent-bg)', 'rgba(167,139,250,.3)', 'var(--accent)'],
    blue:   ['rgba(96,165,250,.12)', 'rgba(96,165,250,.3)', '#60a5fa'],
    dim:    ['var(--s3)', 'var(--border)', 'var(--text3)'],
  };
  const [bg, border, text] = colors[color || 'dim'];
  return (
    <span style={{
      display: 'inline-block', padding: '1px 7px', borderRadius: 4, fontSize: 11,
      fontFamily: 'var(--mono)', background: bg, border: `1px solid ${border}`, color: text,
    }}>{children}</span>
  );
}

export function Kbd({ children }) {
  return (
    <kbd style={{
      display: 'inline-block', padding: '2px 7px',
      background: 'var(--s3)', border: '1px solid var(--border)',
      borderRadius: 5, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text1)',
      boxShadow: '0 1px 0 var(--s3)',
    }}>{children}</kbd>
  );
}

export function BoolDot({ value }) {
  const on = ['yes','true','1','on'].includes(String(value).toLowerCase());
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: on ? '#4ade80' : 'var(--s3)',
        boxShadow: on ? '0 0 6px #4ade8080' : 'none',
        display: 'inline-block',
      }} />
      <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: on ? '#4ade80' : 'var(--text3)' }}>
        {on ? 'yes' : 'no'}
      </span>
    </span>
  );
}

export function ColorSwatch({ value }) {
  if (!value) return null;
  let bg = 'transparent';
  const hexMatch = value.match(/(?:0x|#)([0-9a-fA-F]{6})/);
  const rgbaMatch = value.match(/rgba?\(([^)]+)\)/);
  if (hexMatch) bg = '#' + hexMatch[1].slice(0, 6);
  else if (rgbaMatch) {
    const p = rgbaMatch[1].split(',').map(s => s.trim());
    if (p.length >= 3) bg = `rgb(${p[0]},${p[1]},${p[2]})`;
  }
  const isGradient = value.includes('deg');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
      {isGradient
        ? value.match(/0x[0-9a-fA-F]+|rgba?\([^)]+\)|#[0-9a-fA-F]+/g)?.slice(0, 3).map((c, i) => {
            const m = c.match(/(?:0x|#)([0-9a-fA-F]{6})/);
            const rm = c.match(/rgba?\(([^)]+)\)/);
            let swBg = '#888';
            if (m) swBg = '#' + m[1].slice(0,6);
            else if (rm) { const p = rm[1].split(','); swBg = `rgb(${p[0]},${p[1]},${p[2]})`; }
            return <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: swBg, border: '1px solid var(--border)', display: 'inline-block' }} />;
          })
        : <span style={{ width: 12, height: 12, borderRadius: 3, background: bg, border: '1px solid var(--border)', display: 'inline-block' }} />
      }
      <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--accent-soft)', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

export function BezierCanvas({ x0, y0, x1, y1, w = 130, h = 80 }) {
  const pad = 12, iw = w - pad*2, ih = h - pad*2;
  const pts = Array.from({ length: 80 }, (_, i) => {
    const t = i / 79;
    const cx1 = parseFloat(x0)||0, cy1 = 1-(parseFloat(y0)||0);
    const cx2 = parseFloat(x1)||1, cy2 = 1-(parseFloat(y1)||1);
    return [
      pad + (3*cx1*t*(1-t)**2 + 3*cx2*t**2*(1-t) + t**3) * iw,
      pad + ih - (3*cy1*t*(1-t)**2 + 3*cy2*t**2*(1-t) + t**3) * ih,
    ];
  });
  const d = pts.map((p,i) => `${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const cp1 = [pad+(parseFloat(x0)||0)*iw, pad+ih-(parseFloat(y0)||0)*ih];
  const cp2 = [pad+(parseFloat(x1)||1)*iw, pad+ih-(parseFloat(y1)||1)*ih];
  return (
    <svg width={w} height={h} style={{ display:'block', borderRadius:5, background:'var(--s3)', flexShrink:0 }}>
      <line x1={pad} y1={pad+ih} x2={cp1[0]} y2={cp1[1]} stroke="var(--accent)" strokeOpacity={.3} strokeWidth={1} strokeDasharray="3,2"/>
      <line x1={pad+iw} y1={pad} x2={cp2[0]} y2={cp2[1]} stroke="var(--accent)" strokeOpacity={.3} strokeWidth={1} strokeDasharray="3,2"/>
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth={1.8} strokeLinecap="round"/>
      <circle cx={cp1[0]} cy={cp1[1]} r={3} fill="var(--accent)"/>
      <circle cx={cp2[0]} cy={cp2[1]} r={3} fill="var(--accent)"/>
    </svg>
  );
}

export function Spinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding: 48 }}>
      <div style={{ width:24, height:24, borderRadius:'50%', border:'2px solid var(--s3)', borderTopColor:'var(--accent)', animation:'spin .7s linear infinite' }}/>
    </div>
  );
}

export function ErrorMsg({ msg }) {
  return (
    <div style={{
      margin:16, padding:'12px 16px', borderRadius:8,
      background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.25)',
      color:'#f87171', fontSize:13,
    }}>{msg}</div>
  );
}

export function EmptyState({ msg }) {
  return (
    <div style={{ padding: 40, textAlign:'center', color:'var(--text3)', fontSize:13 }}>{msg}</div>
  );
}

export function ReloadBtn({ onClick }) {
  return (
    <button onClick={onClick} title="Reload from disk" style={{
      background:'transparent', border:'1px solid var(--border)', borderRadius:5,
      color:'var(--text3)', fontSize:12, padding:'3px 8px', cursor:'pointer',
    }}>↻ reload</button>
  );
}
