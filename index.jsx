import { useState, useRef, useEffect } from "react";

const NAV = [
  { id: "general", icon: "⊞", label: "General" },
  { id: "workspaces", icon: "◫", label: "Workspaces" },
  { id: "windowrules", icon: "▣", label: "Window Rules" },
  { id: "layerrules", icon: "◧", label: "Layer Rules" },
  { id: "monitor", icon: "◻", label: "Monitor" },
  { id: "input", icon: "⌨", label: "Input" },
  { id: "envvars", icon: "⚙", label: "Env Variables" },
  { id: "globals", icon: "◈", label: "Globals" },
  { id: "permissions", icon: "🔒", label: "Permissions" },
  { id: "autostart", icon: "▶", label: "AutoStart" },
  { id: "miscellaneous", icon: "⋯", label: "Miscellaneous" },
  { id: "settings", icon: "✦", label: "Settings" },
  { id: "debug", icon: "⬡", label: "Debug / Testing" },
  { id: "wiki", icon: "📖", label: "Wiki" },
];

const SETTINGS_DATA = {
  general: {
    title: "General",
    groups: [
      {
        name: "# Hyprland Configuration",
        items: [
          { key: "source", value: "./dms/colors.conf", type: "file", comment: "" },
          { key: "source", value: "./dms/outputs.conf # test", type: "file", comment: "test" },
          { key: "Comment", value: "test", type: "string", comment: "" },
          { key: "source", value: "./dms/layout.conf", type: "file", tag: "Location: hyprland.conf", comment: "" },
          { key: "source", value: "./dms/cursor.conf", type: "file", comment: "" },
          { key: "source", value: "./dms/binds.conf", type: "file", comment: "" },
          { key: "source", value: "windowrules.conf", type: "file", comment: "" },
          { key: "source", value: "animations.conf", type: "file", comment: "" },
          { key: "source", value: "keybindings.conf", type: "file", comment: "" },
          { key: "source", value: "hyprscrolling.conf", type: "file", comment: "" },
        ],
      },
      {
        name: "# HyprEmoji config",
        items: [
          { key: "source", value: "~/.config/hypremoji/hypremoji.conf", type: "file", comment: "" },
          { key: "source", value: "./hyprvis.conf", type: "file", comment: "# Source for Hyprvis" },
        ],
      },
    ],
  },
  monitor: {
    title: "Monitor",
    groups: [
      {
        name: "# Monitor Configuration",
        items: [
          { key: "monitor", value: "DP-1, 2560x1440@144, 0x0, 1", type: "string", comment: "" },
          { key: "monitor", value: "HDMI-A-1, 1920x1080@60, 2560x0, 1", type: "string", comment: "" },
          { key: "monitor", value: ", preferred, auto, 1", type: "string", comment: "# Fallback" },
        ],
      },
    ],
  },
  input: {
    title: "Input",
    groups: [
      {
        name: "input",
        items: [
          { key: "kb_layout", value: "us", type: "string", comment: "" },
          { key: "kb_variant", value: "", type: "string", comment: "" },
          { key: "kb_model", value: "", type: "string", comment: "" },
          { key: "kb_options", value: "caps:super", type: "string", comment: "" },
          { key: "follow_mouse", value: "1", type: "number", comment: "" },
          { key: "sensitivity", value: "0", type: "number", comment: "" },
          { key: "touchpad.natural_scroll", value: "yes", type: "bool", comment: "" },
        ],
      },
    ],
  },
  workspaces: {
    title: "Workspaces",
    groups: [
      {
        name: "# Workspace Rules",
        items: [
          { key: "workspace", value: "1, monitor:DP-1, default:true", type: "string", comment: "" },
          { key: "workspace", value: "2, monitor:DP-1", type: "string", comment: "" },
          { key: "workspace", value: "3, monitor:HDMI-A-1", type: "string", comment: "" },
          { key: "workspace", value: "special:magic, on-created-empty:[float] foot", type: "string", comment: "" },
        ],
      },
    ],
  },
  windowrules: {
    title: "Window Rules",
    groups: [
      {
        name: "# Float rules",
        items: [
          { key: "windowrule", value: "float, ^(pavucontrol)$", type: "string", comment: "" },
          { key: "windowrule", value: "float, ^(blueman-manager)$", type: "string", comment: "" },
          { key: "windowrule", value: "float, title:^(Picture-in-Picture)$", type: "string", comment: "" },
          { key: "windowrulev2", value: "suppressevent maximize, class:.*", type: "string", comment: "" },
        ],
      },
    ],
  },
  layerrules: { title: "Layer Rules", groups: [{ name: "# Layer Rules", items: [{ key: "layerrule", value: "blur, gtk-layer-shell", type: "string" }, { key: "layerrule", value: "blur, waybar", type: "string" }] }] },
  envvars: {
    title: "Env Variables",
    groups: [
      {
        name: "# Environment",
        items: [
          { key: "env", value: "XCURSOR_SIZE,24", type: "string", comment: "" },
          { key: "env", value: "HYPRCURSOR_SIZE,24", type: "string", comment: "" },
          { key: "env", value: "QT_QPA_PLATFORM,wayland", type: "string", comment: "" },
          { key: "env", value: "MOZ_ENABLE_WAYLAND,1", type: "string", comment: "" },
        ],
      },
    ],
  },
  globals: {
    title: "Globals",
    groups: [
      {
        name: "general",
        items: [
          { key: "gaps_in", value: "3", type: "number", comment: "" },
          { key: "gaps_out", value: "3", type: "number", comment: "" },
          { key: "border_size", value: "3", type: "number", comment: "" },
          { key: "col.active_border", value: "$primary", type: "color", comment: "" },
          { key: "col.inactive_border", value: "$outline", type: "color", comment: "" },
          { key: "layout", value: "dwindle", type: "string", comment: "" },
          { key: "allow_tearing", value: "false", type: "bool", comment: "" },
        ],
      },
      {
        name: "decoration",
        items: [
          { key: "rounding", value: "10", type: "number", comment: "" },
          { key: "blur.enabled", value: "true", type: "bool", comment: "" },
          { key: "blur.size", value: "3", type: "number", comment: "" },
          { key: "blur.passes", value: "1", type: "number", comment: "" },
          { key: "drop_shadow", value: "true", type: "bool", comment: "" },
          { key: "shadow_range", value: "4", type: "number", comment: "" },
          { key: "shadow_render_power", value: "3", type: "number", comment: "" },
          { key: "col.shadow", value: "rgba(1a1a1aee)", type: "color", comment: "" },
        ],
      },
    ],
  },
  permissions: { title: "Permissions", groups: [{ name: "# Permissions", items: [{ key: "ecosystem:no_donation_nag", value: "true", type: "bool" }] }] },
  autostart: {
    title: "AutoStart",
    groups: [
      {
        name: "# Autostart",
        items: [
          { key: "exec-once", value: "waybar", type: "string", comment: "" },
          { key: "exec-once", value: "hyprpaper", type: "string", comment: "" },
          { key: "exec-once", value: "dunst", type: "string", comment: "" },
          { key: "exec-once", value: "nm-applet --indicator", type: "string", comment: "" },
          { key: "exec-once", value: "blueman-applet", type: "string", comment: "" },
        ],
      },
    ],
  },
  miscellaneous: {
    title: "Miscellaneous",
    groups: [
      {
        name: "misc",
        items: [
          { key: "force_default_wallpaper", value: "-1", type: "number", comment: "" },
          { key: "disable_hyprland_logo", value: "false", type: "bool", comment: "" },
          { key: "enable_swallow", value: "true", type: "bool", comment: "" },
          { key: "swallow_regex", value: "^(kitty)$", type: "string", comment: "" },
        ],
      },
    ],
  },
  settings: {
    title: "Settings",
    isSettings: true,
  },
  debug: {
    title: "Debug / Testing",
    groups: [
      {
        name: "debug",
        items: [
          { key: "overlay", value: "false", type: "bool", comment: "" },
          { key: "damage_blink", value: "false", type: "bool", comment: "" },
          { key: "disable_logs", value: "true", type: "bool", comment: "" },
          { key: "disable_time", value: "true", type: "bool", comment: "" },
        ],
      },
    ],
  },
  wiki: {
    title: "Wiki",
    isWiki: true,
  },
};

const ANIMATIONS_DATA = [
  { name: "global", enabled: true, speed: null, curve: null, style: null, isGlobal: true },
  { name: "workspaces", enabled: true, speed: 0.8, curve: "easeOutQuint", style: "slide", bezierPreview: [0.11, 0.86, 0.51, 1.21] },
  { name: "windows", enabled: true, speed: 0.5, curve: "easeOutQuint", style: "popin 80%", bezierPreview: [0.11, 0.86, 0.51, 1.21] },
  { name: "fade", enabled: true, speed: 0.5, curve: "default", style: null },
  { name: "border", enabled: true, speed: 1.0, curve: "default", style: null },
  { name: "borderangle", enabled: true, speed: 1.0, curve: "default", style: "once" },
  { name: "layers", enabled: true, speed: 0.3, curve: "easeOutQuint", style: "slide" },
  { name: "specialWorkspace", enabled: true, speed: 0.5, curve: "easeOutQuint", style: "slidevert" },
];

const BINDS_DATA = [
  { mod: "SUPER", key: "Return", action: "exec", value: "kitty", comment: "Terminal" },
  { mod: "SUPER", key: "Q", action: "killactive", value: "", comment: "Close window" },
  { mod: "SUPER", key: "E", action: "exec", value: "nautilus", comment: "File manager" },
  { mod: "SUPER", key: "V", action: "togglefloating", value: "", comment: "Toggle float" },
  { mod: "SUPER", key: "R", action: "exec", value: "wofi --show drun", comment: "App launcher" },
  { mod: "SUPER", key: "P", action: "pseudo", value: "", comment: "Dwindle pseudo" },
  { mod: "SUPER", key: "J", action: "togglesplit", value: "", comment: "Toggle split" },
  { mod: "SUPER", key: "F", action: "fullscreen", value: "0", comment: "Fullscreen" },
  { mod: "SUPER SHIFT", key: "F", action: "fullscreen", value: "1", comment: "Maximize" },
  { mod: "SUPER", key: "left", action: "movefocus", value: "l", comment: "" },
  { mod: "SUPER", key: "right", action: "movefocus", value: "r", comment: "" },
  { mod: "SUPER", key: "up", action: "movefocus", value: "u", comment: "" },
  { mod: "SUPER", key: "down", action: "movefocus", value: "d", comment: "" },
  { mod: "SUPER", key: "1", action: "workspace", value: "1", comment: "" },
  { mod: "SUPER", key: "2", action: "workspace", value: "2", comment: "" },
  { mod: "SUPER", key: "3", action: "workspace", value: "3", comment: "" },
];

const LOOK_FEEL_DATA = {
  inactive_opacity: 1.0,
  shadow_enabled: true,
  shadow_color_inactive: "rgba(48,48,48,1)",
  col_active_border: "$primary",
  col_inactive_border: "$outline",
  gaps_in: 3,
  gaps_out: 3,
  border_size: 3,
  rounding: 10,
};

const WIKI_DATA = [
  {
    title: "Binds",
    content: "Binds are defined with bind = MOD, key, dispatcher, args. The bind keyword can have flags appended (e.g. bindm for mouse, bindr for on-release). Use xkbsyms for key names.",
    sub: [
      { title: "Uncommon keycodes", content: "See the xkbsyms header for a full list of keysyms. They start after XKB_KEY_XF86. If you want to bind a key without a modifier, use bind = , KEY, dispatcher." },
      { title: "Mouse binds", content: "bindm = SUPER, mouse:272, movewindow — This will move the window when SUPER + LMB is held." },
    ],
  },
  {
    title: "Configuring Animations",
    content: "Animations are defined with animation = NAME, ENABLED, SPEED, CURVE, STYLE. Default curves: default, linear, workspaces. Custom bezier curves can be added with bezier = name, x0, y0, x1, y1.",
  },
  {
    title: "Window Rules",
    content: "windowrule = rule, class — Applies a rule to windows matching the regex class. windowrulev2 supports additional selectors like title, xwayland, floating, etc.",
  },
];

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: checked ? "var(--accent)" : "var(--surface2)",
        position: "relative", cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        background: "#fff",
        position: "absolute", top: 3,
        left: checked ? 19 : 3,
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }} />
    </div>
  );
}

function BezierPreview({ points }) {
  const [p0x, p0y, p1x, p1y] = points;
  const w = 160, h = 100, pad = 16;
  const iw = w - pad * 2, ih = h - pad * 2;

  const pts = Array.from({ length: 60 }, (_, i) => {
    const t = i / 59;
    const cx1 = p0x, cy1 = 1 - p0y, cx2 = p1x, cy2 = 1 - p1y;
    const bx = 3 * cx1 * t * (1 - t) ** 2 + 3 * cx2 * t ** 2 * (1 - t) + t ** 3;
    const by = 3 * cy1 * t * (1 - t) ** 2 + 3 * cy2 * t ** 2 * (1 - t) + t ** 3;
    return [pad + bx * iw, pad + ih - by * ih];
  });

  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const c1 = [pad, pad + ih];
  const cp1 = [pad + p0x * iw, pad + ih - p0y * ih];
  const cp2 = [pad + p1x * iw, pad + ih - p1y * ih];
  const c2 = [pad + iw, pad];

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <rect width={w} height={h} rx={6} fill="var(--surface2)" />
      <line x1={c1[0]} y1={c1[1]} x2={cp1[0]} y2={cp1[1]} stroke="var(--accent)" strokeOpacity={0.4} strokeWidth={1} strokeDasharray="3,2" />
      <line x1={c2[0]} y1={c2[1]} x2={cp2[0]} y2={cp2[1]} stroke="var(--accent)" strokeOpacity={0.4} strokeWidth={1} strokeDasharray="3,2" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2} />
      <circle cx={cp1[0]} cy={cp1[1]} r={3} fill="var(--accent)" />
      <circle cx={cp2[0]} cy={cp2[1]} r={3} fill="var(--accent)" />
      <circle cx={c1[0]} cy={c1[1]} r={3} fill="var(--text-muted)" />
      <circle cx={c2[0]} cy={c2[1]} r={3} fill="var(--text-muted)" />
    </svg>
  );
}

function ConfigItem({ item, showComments, showLinePreview }) {
  const [val, setVal] = useState(item.value ?? item.val ?? "");
  const [hovered, setHovered] = useState(false);

  const isFile = item.type === "file";
  const isBool = item.type === "bool";
  const isColor = item.type === "color";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "5px 10px", borderRadius: 6,
        background: hovered ? "var(--surface2)" : "transparent",
        transition: "background 0.15s", cursor: "pointer",
        position: "relative",
      }}
    >
      {showLinePreview && (
        <span style={{ fontSize: 10, color: "var(--text-dim)", minWidth: 28, textAlign: "right", fontFamily: "monospace" }}>
          {Math.floor(Math.random() * 30) + 1}
        </span>
      )}
      <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace", minWidth: 160, flexShrink: 0 }}>
        {item.key}
      </span>
      {isFile ? (
        <span style={{ fontSize: 12, color: "var(--accent-soft)", fontFamily: "monospace", flex: 1 }}>{val}</span>
      ) : isBool ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <Toggle checked={val === "true" || val === "yes" || val === true} onChange={(v) => setVal(v ? "true" : "false")} />
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{val === "true" || val === "yes" || val === true ? "on" : "off"}</span>
        </div>
      ) : isColor ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: val.startsWith("rgba") ? val : "#7c5cbf", border: "1px solid var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--text-main)", fontFamily: "monospace" }}>{val}</span>
        </div>
      ) : (
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "var(--text-main)", fontSize: 12, fontFamily: "monospace",
            flex: 1,
          }}
        />
      )}
      {item.tag && (
        <span style={{
          fontSize: 10, color: "var(--accent)", background: "var(--accent-bg)",
          padding: "1px 6px", borderRadius: 4, fontFamily: "monospace",
        }}>📍 {item.tag}</span>
      )}
      {showComments && item.comment && (
        <span style={{ fontSize: 11, color: "var(--text-dim)", fontStyle: "italic" }}>// {item.comment}</span>
      )}
    </div>
  );
}

function SettingsPanel({ uiSettings, setUiSettings }) {
  const themes = ["Sandcastle", "Catppuccin Mocha", "Tokyo Night", "Gruvbox", "Nord", "Dracula"];
  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Display</div>
        {[
          { key: "autosave", label: "Autosave" },
          { key: "showHeaderComments", label: "Show header comments" },
          { key: "showLineComments", label: "Show line comments" },
          { key: "showConfigLinePreview", label: "Show config line preview comments" },
          { key: "showSidebarIcons", label: "Show sidebar icons" },
          { key: "enableAnimations", label: "Enable Animations" },
        ].map(opt => (
          <div key={opt.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 4px" }}>
            <span style={{ fontSize: 13, color: "var(--text-main)" }}>{opt.label}</span>
            <Toggle checked={uiSettings[opt.key]} onChange={v => setUiSettings(p => ({ ...p, [opt.key]: v }))} />
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Theme</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {themes.map(t => (
            <button key={t} onClick={() => setUiSettings(p => ({ ...p, theme: t }))}
              style={{
                padding: "5px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                background: uiSettings.theme === t ? "var(--accent)" : "var(--surface2)",
                color: uiSettings.theme === t ? "#fff" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}>{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WikiPanel() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ padding: 8 }}>
      {WIKI_DATA.map((section, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              padding: "8px 12px", borderRadius: 6, cursor: "pointer",
              background: open === i ? "var(--surface2)" : "transparent",
              color: "var(--text-main)", fontWeight: 600, fontSize: 13,
              display: "flex", justifyContent: "space-between",
            }}
          >
            {section.title}
            <span style={{ color: "var(--text-dim)" }}>{open === i ? "▾" : "▸"}</span>
          </div>
          {open === i && (
            <div style={{ padding: "8px 12px 12px 20px", color: "var(--text-muted)", fontSize: 12, lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 8px" }}>{section.content}</p>
              {section.sub?.map((s, j) => (
                <div key={j} style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-soft)", marginBottom: 4 }}>{s.title}</div>
                  <p style={{ margin: 0, fontSize: 11 }}>{s.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AnimationsPanel() {
  const [anims, setAnims] = useState(ANIMATIONS_DATA);
  return (
    <div style={{ padding: 8 }}>
      {anims.map((anim, i) => (
        <div key={i} style={{
          padding: "10px 12px", marginBottom: 4, borderRadius: 8,
          background: "var(--surface2)", display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Toggle checked={anim.enabled} onChange={v => setAnims(a => a.map((x, j) => j === i ? { ...x, enabled: v } : x))} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", fontFamily: "monospace" }}>{anim.name}</span>
            {anim.speed && <span style={{ fontSize: 11, color: "var(--text-dim)" }}>speed {anim.speed}s</span>}
            {anim.curve && <span style={{ fontSize: 11, color: "var(--accent-soft)", fontFamily: "monospace" }}>{anim.curve}</span>}
            {anim.style && <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{anim.style}</span>}
          </div>
          {anim.bezierPreview && anim.enabled && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <BezierPreview points={anim.bezierPreview} />
              <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "monospace", lineHeight: 1.8 }}>
                <div>bezier {anim.curve}, {anim.bezierPreview.join(",")}</div>
                <div style={{ color: "var(--text-muted)" }}>{anim.curve}</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BindsPanel() {
  const [search, setSearch] = useState("");
  const filtered = BINDS_DATA.filter(b =>
    b.mod.toLowerCase().includes(search.toLowerCase()) ||
    b.key.toLowerCase().includes(search.toLowerCase()) ||
    b.action.toLowerCase().includes(search.toLowerCase()) ||
    b.value.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ padding: 8 }}>
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Filter binds..."
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "7px 12px", borderRadius: 7, marginBottom: 10,
          background: "var(--surface2)", border: "1px solid var(--border)",
          color: "var(--text-main)", fontSize: 12, outline: "none",
        }}
      />
      {filtered.map((b, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 8px", borderRadius: 6,
          background: i % 2 === 0 ? "transparent" : "var(--surface2)",
        }}>
          <span style={{
            fontSize: 11, fontFamily: "monospace", fontWeight: 700,
            color: "var(--accent)", background: "var(--accent-bg)",
            padding: "1px 6px", borderRadius: 4, whiteSpace: "nowrap",
          }}>{b.mod}</span>
          <span style={{
            fontSize: 11, fontFamily: "monospace",
            color: "#fff", background: "var(--surface3)",
            padding: "1px 6px", borderRadius: 4,
          }}>{b.key}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", flex: 1, fontFamily: "monospace" }}>
            {b.action}{b.value ? ` ${b.value}` : ""}
          </span>
          {b.comment && <span style={{ fontSize: 11, color: "var(--text-dim)", fontStyle: "italic" }}>{b.comment}</span>}
        </div>
      ))}
    </div>
  );
}

function LookFeelPanel() {
  const [vals, setVals] = useState(LOOK_FEEL_DATA);
  const set = (k, v) => setVals(p => ({ ...p, [k]: v }));

  return (
    <div style={{ padding: 8 }}>
      {[
        { label: "Inactive opacity", key: "inactive_opacity", type: "number", min: 0, max: 1, step: 0.05 },
        { label: "Shadow", key: "shadow_enabled", type: "bool" },
        { label: "Color inactive", key: "shadow_color_inactive", type: "color" },
        { label: "Col.active border", key: "col_active_border", type: "string" },
        { label: "Col.inactive border", key: "col_inactive_border", type: "string" },
        { label: "Gaps in", key: "gaps_in", type: "number", min: 0, max: 30, step: 1 },
        { label: "Gaps out", key: "gaps_out", type: "number", min: 0, max: 30, step: 1 },
        { label: "Border size", key: "border_size", type: "number", min: 0, max: 20, step: 1 },
        { label: "Rounding", key: "rounding", type: "number", min: 0, max: 30, step: 1 },
      ].map(field => (
        <div key={field.key} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 6px", borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 13, color: "var(--text-main)" }}>{field.label}</span>
          {field.type === "bool" ? (
            <Toggle checked={vals[field.key]} onChange={v => set(field.key, v)} />
          ) : field.type === "number" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="range" min={field.min} max={field.max} step={field.step}
                value={vals[field.key]}
                onChange={e => set(field.key, parseFloat(e.target.value))}
                style={{ width: 80, accentColor: "var(--accent)" }}
              />
              <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)", minWidth: 28, textAlign: "right" }}>
                {vals[field.key]}
              </span>
            </div>
          ) : field.type === "color" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: vals[field.key].startsWith("rgba") ? vals[field.key] : "#7c5cbf", border: "1px solid var(--border)" }} />
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)" }}>{vals[field.key]}</span>
            </div>
          ) : (
            <input value={vals[field.key]} onChange={e => set(field.key, e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", color: "var(--accent-soft)", fontSize: 12, fontFamily: "monospace", textAlign: "right" }} />
          )}
        </div>
      ))}
    </div>
  );
}

function GenericSection({ data, showComments, showLinePreview }) {
  return (
    <div style={{ padding: 8 }}>
      {data.groups.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--text-dim)", padding: "4px 10px", fontFamily: "monospace" }}>{group.name}</div>
          {group.items.map((item, ii) => (
            <ConfigItem key={ii} item={item} showComments={showComments} showLinePreview={showLinePreview} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function HyprSettings() {
  const [active, setActive] = useState("general");
  const [search, setSearch] = useState("");
  const [uiSettings, setUiSettings] = useState({
    autosave: true,
    showHeaderComments: true,
    showLineComments: true,
    showConfigLinePreview: false,
    showSidebarIcons: true,
    enableAnimations: true,
    theme: "Sandcastle",
  });

  const THEMES = {
    "Sandcastle": {
      "--bg": "#1a1a2e", "--surface": "#16213e", "--surface2": "#0f3460",
      "--surface3": "#533483", "--border": "#2a2a4a", "--accent": "#a78bfa",
      "--accent-soft": "#c4b5fd", "--accent-bg": "rgba(167,139,250,0.12)",
      "--text-main": "#e2e8f0", "--text-muted": "#94a3b8", "--text-dim": "#475569",
    },
    "Catppuccin Mocha": {
      "--bg": "#1e1e2e", "--surface": "#181825", "--surface2": "#313244",
      "--surface3": "#45475a", "--border": "#313244", "--accent": "#cba6f7",
      "--accent-soft": "#f5c2e7", "--accent-bg": "rgba(203,166,247,0.12)",
      "--text-main": "#cdd6f4", "--text-muted": "#a6adc8", "--text-dim": "#6c7086",
    },
    "Tokyo Night": {
      "--bg": "#1a1b26", "--surface": "#16161e", "--surface2": "#1f2335",
      "--surface3": "#24283b", "--border": "#2f3549", "--accent": "#7aa2f7",
      "--accent-soft": "#bb9af7", "--accent-bg": "rgba(122,162,247,0.12)",
      "--text-main": "#c0caf5", "--text-muted": "#9aa5ce", "--text-dim": "#565f89",
    },
    "Gruvbox": {
      "--bg": "#282828", "--surface": "#1d2021", "--surface2": "#3c3836",
      "--surface3": "#504945", "--border": "#3c3836", "--accent": "#d79921",
      "--accent-soft": "#fabd2f", "--accent-bg": "rgba(215,153,33,0.12)",
      "--text-main": "#ebdbb2", "--text-muted": "#d5c4a1", "--text-dim": "#928374",
    },
    "Nord": {
      "--bg": "#2e3440", "--surface": "#242933", "--surface2": "#3b4252",
      "--surface3": "#434c5e", "--border": "#3b4252", "--accent": "#88c0d0",
      "--accent-soft": "#81a1c1", "--accent-bg": "rgba(136,192,208,0.12)",
      "--text-main": "#eceff4", "--text-muted": "#d8dee9", "--text-dim": "#616e88",
    },
    "Dracula": {
      "--bg": "#282a36", "--surface": "#21222c", "--surface2": "#343746",
      "--surface3": "#44475a", "--border": "#343746", "--accent": "#bd93f9",
      "--accent-soft": "#ff79c6", "--accent-bg": "rgba(189,147,249,0.12)",
      "--text-main": "#f8f8f2", "--text-muted": "#6272a4", "--text-dim": "#44475a",
    },
  };

  const theme = THEMES[uiSettings.theme] || THEMES["Sandcastle"];

  const filteredNav = search
    ? NAV.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
    : NAV;

  function renderContent() {
    const data = SETTINGS_DATA[active];
    if (!data) return null;
    if (active === "settings") return <SettingsPanel uiSettings={uiSettings} setUiSettings={setUiSettings} />;
    if (active === "wiki") return <WikiPanel />;
    if (active === "globals") return (
      <div>
        <div style={{ borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
          <LookFeelPanel />
        </div>
      </div>
    );
    if (active === "input") {
      const d = SETTINGS_DATA.input;
      return (
        <div>
          <GenericSection data={d} showComments={uiSettings.showLineComments} showLinePreview={uiSettings.showConfigLinePreview} />
        </div>
      );
    }
    if (data.groups) {
      return <GenericSection data={data} showComments={uiSettings.showLineComments} showLinePreview={uiSettings.showConfigLinePreview} />;
    }
    return null;
  }

  return (
    <div style={{ ...Object.fromEntries(Object.entries(theme)), minHeight: "100vh", background: "var(--bg)", color: "var(--text-main)", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", display: "flex", flexDirection: "column" }}>
      {/* Titlebar */}
      <div style={{
        height: 40, background: "var(--surface)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
        userSelect: "none",
      }}>
        <span style={{ color: "var(--accent)", fontSize: 16 }}>✦</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>HyprSettings</span>
        <span style={{
          fontSize: 10, padding: "1px 7px", borderRadius: 4,
          background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent)",
        }}>Debug</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>0.9.3.0</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["—", "□", "×"].map(c => (
            <div key={c} style={{
              width: 24, height: 24, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--surface2)", color: "var(--text-muted)", fontSize: 12, cursor: "pointer",
            }}>{c}</div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: 200, background: "var(--surface)", borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", overflowY: "auto",
        }}>
          {/* Search */}
          <div style={{ padding: "10px 10px 6px" }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="⌕ Press / to search..."
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "6px 10px", borderRadius: 6,
                background: "var(--surface2)", border: "1px solid var(--border)",
                color: "var(--text-main)", fontSize: 11, outline: "none",
              }}
            />
          </div>

          {/* Nav groups */}
          <div style={{ padding: "4px 6px", flex: 1 }}>
            {[
              { label: "LAYOUTS", items: filteredNav.slice(0, 3) },
              { label: "SYSTEM & DEVICES", items: filteredNav.filter(n => ["monitor","input","envvars"].includes(n.id)) },
              { label: "SYSTEM BEHAVIOR", items: filteredNav.filter(n => ["globals","permissions","autostart","miscellaneous"].includes(n.id)) },
              { label: "UTILITY & DEBUGGING", items: filteredNav.filter(n => ["settings","debug","wiki"].includes(n.id)) },
            ].map(group => (
              <div key={group.label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "var(--text-dim)", padding: "4px 6px 2px", letterSpacing: 1.2, textTransform: "uppercase" }}>{group.label}</div>
                {group.items.map(nav => (
                  <div
                    key={nav.id}
                    onClick={() => setActive(nav.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 8px", borderRadius: 6, cursor: "pointer",
                      background: active === nav.id ? "var(--accent-bg)" : "transparent",
                      color: active === nav.id ? "var(--accent)" : "var(--text-muted)",
                      fontSize: 12,
                      borderLeft: active === nav.id ? "2px solid var(--accent)" : "2px solid transparent",
                    }}
                  >
                    {uiSettings.showSidebarIcons && <span style={{ fontSize: 13, opacity: 0.7 }}>{nav.icon}</span>}
                    {nav.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ padding: "8px 12px", fontSize: 10, color: "var(--text-dim)", borderTop: "1px solid var(--border)" }}>HyprSettings</div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Sub-nav tabs for animations/binds/look&feel etc */}
          {["globals", "general"].includes(active) && (
            <div style={{
              display: "flex", gap: 2, padding: "8px 12px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)",
            }}>
              {(active === "globals"
                ? [["look", "Look & Feel"], ["animations", "Animations"]]
                : [["general", "General"]]
              ).map(([id, label]) => (
                <div key={id} style={{
                  padding: "4px 12px", borderRadius: 5, fontSize: 12, cursor: "pointer",
                  background: "var(--accent-bg)", color: "var(--accent)",
                  border: "1px solid var(--accent)",
                }}>{label}</div>
              ))}
            </div>
          )}

          {/* Section header */}
          <div style={{
            padding: "12px 16px 8px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)" }}>
              {SETTINGS_DATA[active]?.title}
            </div>
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {active === "globals" ? (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 300px", minWidth: 260 }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", padding: "4px 6px 8px", textTransform: "uppercase", letterSpacing: 1 }}>Look & Feel</div>
                  <LookFeelPanel />
                </div>
                <div style={{ flex: "1 1 340px", minWidth: 280 }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", padding: "4px 6px 8px", textTransform: "uppercase", letterSpacing: 1 }}>Animations</div>
                  <AnimationsPanel />
                </div>
              </div>
            ) : active === "workspaces" ? (
              <div>
                <GenericSection data={SETTINGS_DATA.workspaces} showComments={uiSettings.showLineComments} showLinePreview={uiSettings.showConfigLinePreview} />
              </div>
            ) : active === "autostart" ? (
              <GenericSection data={SETTINGS_DATA.autostart} showComments={uiSettings.showLineComments} showLinePreview={uiSettings.showConfigLinePreview} />
            ) : active === "envvars" ? (
              <GenericSection data={SETTINGS_DATA.envvars} showComments={uiSettings.showLineComments} showLinePreview={uiSettings.showConfigLinePreview} />
            ) : active === "windowrules" ? (
              <GenericSection data={SETTINGS_DATA.windowrules} showComments={uiSettings.showLineComments} showLinePreview={uiSettings.showConfigLinePreview} />
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 4px; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: var(--surface3); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); cursor: pointer; }
      `}</style>
    </div>
  );
}
