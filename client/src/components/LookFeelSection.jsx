import { api } from '../lib/api.js';
import { useSection } from '../hooks/useSection.js';
import { Row, SectionCard, Value, BoolDot, ColorSwatch, Spinner, ErrorMsg, ReloadBtn } from './ui.jsx';

function OpacityBar({ value }) {
  const pct = Math.round(parseFloat(value) * 100);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:80, height:4, borderRadius:2, background:'var(--s3)', position:'relative' }}>
        <div style={{
          position:'absolute', left:0, top:0, height:'100%',
          width:`${pct}%`, borderRadius:2,
          background:'var(--accent)', boxShadow:'0 0 6px var(--accent-glow)',
        }} />
      </div>
      <Value accent>{value}</Value>
    </div>
  );
}

function NumBar({ value, max }) {
  const pct = Math.min(100, Math.round((parseFloat(value) / max) * 100));
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:60, height:3, borderRadius:2, background:'var(--s3)', position:'relative' }}>
        <div style={{
          position:'absolute', left:0, top:0, height:'100%',
          width:`${pct}%`, borderRadius:2, background:'var(--accent)',
        }} />
      </div>
      <Value accent>{value}</Value>
    </div>
  );
}

export default function LookFeelSection() {
  const { data: d, loading, error, reload } = useSection(() => api.getGeneral());

  if (loading) return <Spinner />;
  if (error && !d) return <ErrorMsg msg={error} />;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
        <ReloadBtn onClick={reload} />
      </div>

      <SectionCard title="Window Borders">
        <Row label="Active border color" hint="col.active_border">
          <ColorSwatch value={d.col_active_border} />
        </Row>
        <Row label="Inactive border color" hint="col.inactive_border">
          <ColorSwatch value={d.col_inactive_border} />
        </Row>
        <Row label="Border size" hint="px">
          <NumBar value={d.border_size} max={10} />
        </Row>
        <Row label="Corner rounding" hint="px radius">
          <NumBar value={d.rounding} max={30} />
        </Row>
      </SectionCard>

      <SectionCard title="Gaps">
        <Row label="Inner gaps (gaps_in)">  <NumBar value={d.gaps_in}  max={40} /></Row>
        <Row label="Outer gaps (gaps_out)"> <NumBar value={d.gaps_out} max={60} /></Row>
      </SectionCard>

      <SectionCard title="Opacity">
        <Row label="Active window">   <OpacityBar value={d.active_opacity} /></Row>
        <Row label="Inactive window"> <OpacityBar value={d.inactive_opacity} /></Row>
      </SectionCard>

      <SectionCard title="Shadow">
        <Row label="Drop shadow">         <BoolDot value={d.drop_shadow} /></Row>
        <Row label="Shadow range (px)">   <NumBar value={d.shadow_range} max={60} /></Row>
        <Row label="Render power">        <NumBar value={d.shadow_render_power} max={4} /></Row>
        <Row label="Shadow color">        <ColorSwatch value={d.col_shadow} /></Row>
      </SectionCard>

      <SectionCard title="Blur">
        <Row label="Enabled">    <BoolDot value={d.blur_enabled} /></Row>
        <Row label="Size">       <NumBar value={d.blur_size}       max={20} /></Row>
        <Row label="Passes">     <NumBar value={d.blur_passes}     max={5} /></Row>
        <Row label="Noise">      <Value accent>{d.blur_noise}</Value></Row>
        <Row label="Contrast">   <Value accent>{d.blur_contrast}</Value></Row>
        <Row label="Brightness"> <Value accent>{d.blur_brightness}</Value></Row>
      </SectionCard>
    </div>
  );
}
