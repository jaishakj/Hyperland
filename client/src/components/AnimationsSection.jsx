import { api } from '../lib/api.js';
import { useSection } from '../hooks/useSection.js';
import { SectionCard, Tag, BezierCanvas, Value, Spinner, ErrorMsg, EmptyState, ReloadBtn } from './ui.jsx';

function BezierCard({ bez }) {
  return (
    <div style={{
      background:'var(--s2)', border:'1px solid var(--border)', borderRadius:8,
      padding:'12px', display:'flex', gap:14, alignItems:'flex-start', marginBottom:8,
    }}>
      <BezierCanvas x0={bez.x0} y0={bez.y0} x1={bez.x1} y1={bez.y1} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--accent-soft)', fontFamily:'var(--mono)', marginBottom:8 }}>
          {bez.name}
        </div>
        {[['x0','X₀'], ['y0','Y₀'], ['x1','X₁'], ['y1','Y₁']].map(([k, label]) => (
          <div key={k} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
            <span style={{ fontSize:10, color:'var(--text3)', width:22 }}>{label}</span>
            <div style={{
              flex:1, height:3, borderRadius:2, background:'var(--s3)',
              position:'relative', overflow:'visible',
            }}>
              <div style={{
                position:'absolute', left:`${Math.max(0, Math.min(100, (parseFloat(bez[k])+0.5)/2.5*100))}%`,
                top:'50%', transform:'translate(-50%,-50%)',
                width:7, height:7, borderRadius:'50%', background:'var(--accent)',
                boxShadow:'0 0 4px var(--accent-glow)',
              }} />
            </div>
            <span style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text2)', width:36, textAlign:'right' }}>
              {bez[k]}
            </span>
          </div>
        ))}
        <div style={{ marginTop:8, fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)' }}>
          bezier = {bez.name}, {bez.x0}, {bez.y0}, {bez.x1}, {bez.y1}
        </div>
      </div>
    </div>
  );
}

function AnimRow({ anim, idx }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10, padding:'7px 14px',
      borderBottom:'1px solid var(--border-subtle)',
      background: idx % 2 === 0 ? 'transparent' : 'var(--s2)',
      flexWrap:'wrap',
    }}>
      <span style={{
        width:7, height:7, borderRadius:'50%', flexShrink:0,
        background: anim.enabled ? '#4ade80' : 'var(--s3)',
        boxShadow: anim.enabled ? '0 0 5px #4ade8080' : 'none',
        display:'inline-block',
      }} />
      <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--text1)', minWidth:140 }}>{anim.name}</span>
      <Tag color="dim">{anim.speed}s</Tag>
      <Tag color="purple">{anim.curve}</Tag>
      {anim.style && <Tag color="blue">{anim.style}</Tag>}
      <span style={{ marginLeft:'auto', fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)' }}>
        animation = {anim.name}, {anim.enabled?1:0}, {anim.speed}, {anim.curve}{anim.style ? ', '+anim.style : ''}
      </span>
    </div>
  );
}

export default function AnimationsSection() {
  const { data, loading, error, reload } = useSection(() => api.getAnimations());

  if (loading) return <Spinner />;
  if (error && !data) return <ErrorMsg msg={error} />;

  const { beziers = [], animations = [], source } = data;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>
          {source}
        </span>
        <ReloadBtn onClick={reload} />
      </div>

      <SectionCard title={`Bezier Curves  (${beziers.length})`}>
        <div style={{ padding:'10px 12px' }}>
          {beziers.length === 0
            ? <EmptyState msg="No bezier curves found in config." />
            : beziers.map((b, i) => <BezierCard key={i} bez={b} />)
          }
        </div>
      </SectionCard>

      <SectionCard title={`Animations  (${animations.length})`}>
        {animations.length === 0
          ? <EmptyState msg="No animation directives found." />
          : animations.map((a, i) => <AnimRow key={i} anim={a} idx={i} />)
        }
      </SectionCard>
    </div>
  );
}
