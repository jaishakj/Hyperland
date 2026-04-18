import { api } from '../lib/api.js';
import { useSection } from '../hooks/useSection.js';
import { Row, SectionCard, Value, BoolDot, ColorSwatch, Tag, Spinner, ErrorMsg, ReloadBtn } from './ui.jsx';

const BOOL = v => <BoolDot value={v} />;
const NUM  = v => <Value accent>{v}</Value>;
const STR  = v => <Value>{v}</Value>;
const COL  = v => <ColorSwatch value={v} />;

export default function GeneralSection() {
  const { data: d, loading, error, reload } = useSection(() => api.getGeneral());

  if (loading) return <Spinner />;
  if (error && !d) return <ErrorMsg msg={error} />;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
        <ReloadBtn onClick={reload} />
      </div>

      <SectionCard title="Layout">
        <Row label="Layout engine">       {STR(d.layout)}</Row>
        <Row label="Gaps in"  hint="Inner gap between windows">  {NUM(d.gaps_in)}</Row>
        <Row label="Gaps out" hint="Gap to screen edge">         {NUM(d.gaps_out)}</Row>
        <Row label="Border size" hint="px"> {NUM(d.border_size)}</Row>
        <Row label="Allow tearing">       {BOOL(d.allow_tearing)}</Row>
      </SectionCard>

      <SectionCard title="Border Colors">
        <Row label="Active border"   hint="col.active_border">   {COL(d.col_active_border)}</Row>
        <Row label="Inactive border" hint="col.inactive_border"> {COL(d.col_inactive_border)}</Row>
      </SectionCard>

      <SectionCard title="Decoration">
        <Row label="Rounding"       hint="Corner radius (px)">   {NUM(d.rounding)}</Row>
        <Row label="Active opacity">                              {NUM(d.active_opacity)}</Row>
        <Row label="Inactive opacity">                            {NUM(d.inactive_opacity)}</Row>
        <Row label="Drop shadow">                                 {BOOL(d.drop_shadow)}</Row>
        <Row label="Shadow range"   hint="px">                   {NUM(d.shadow_range)}</Row>
        <Row label="Shadow render power">                         {NUM(d.shadow_render_power)}</Row>
        <Row label="Shadow color">                                {COL(d.col_shadow)}</Row>
      </SectionCard>

      <SectionCard title="Blur">
        <Row label="Enabled">        {BOOL(d.blur_enabled)}</Row>
        <Row label="Size">           {NUM(d.blur_size)}</Row>
        <Row label="Passes">         {NUM(d.blur_passes)}</Row>
        <Row label="Noise">          {NUM(d.blur_noise)}</Row>
        <Row label="Contrast">       {NUM(d.blur_contrast)}</Row>
        <Row label="Brightness">     {NUM(d.blur_brightness)}</Row>
      </SectionCard>

      <SectionCard title="Input">
        <Row label="Keyboard layout">  <Value accent>{d.kb_layout}</Value></Row>
        <Row label="Sensitivity">      {NUM(d.sensitivity)}</Row>
        <Row label="Follow mouse">     {NUM(d.follow_mouse)}</Row>
      </SectionCard>

      <SectionCard title="Misc">
        <Row label="Disable Hyprland logo"> {BOOL(d.disable_hyprland_logo)}</Row>
        <Row label="Enable window swallow"> {BOOL(d.enable_swallow)}</Row>
        <Row label="Force default wallpaper" hint="-1 = random"> {NUM(d.force_default_wallpaper)}</Row>
      </SectionCard>

      <SectionCard title="Dwindle">
        <Row label="Pseudotile">     {BOOL(d.pseudotile)}</Row>
        <Row label="Preserve split"> {BOOL(d.preserve_split)}</Row>
      </SectionCard>
    </div>
  );
}
