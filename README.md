# HyprSettings

Read-only GUI for Hyprland config files. Parses your actual `~/.config/hypr/*.conf` — including `source` directives and `$variable` expansion — and displays everything in a clean browser UI.

## Tabs

| Tab | What it shows |
|-----|---------------|
| **General** | Layout, gaps, borders, decoration, blur, input, misc, dwindle |
| **Look & Feel** | Same data with inline progress bars + color swatches |
| **Animations** | Bezier curve SVG visualizer + animation table |
| **Binds** | Searchable, filterable, grouped by modifier |
| **Variables** | All `$var = value` definitions with resolved values and color swatches |
| **Search** | Debounced full-text search across all merged config tokens |
| **Raw Files** | Syntax-highlighted viewer of every `.conf` in your config dir, with line filter |

## Setup

```bash
# 1. Install all deps
npm install && cd client && npm install && cd ..

# 2. Start API server (port 3847)
node server/index.js

# 3. Start dev UI (port 5173, proxies /api → 3847)
cd client && npm run dev
```

Open **http://localhost:5173**

## Production (single process)

```bash
# Build React to dist/
npm run build

# Serve everything from one port
node server/index.js
# Open http://localhost:3847
```

## Custom config directory

```bash
HYPR_DIR=/path/to/hypr node server/index.js
```

## API reference

| Endpoint | Description |
|----------|-------------|
| `GET /api/info` | Config dir, file list, sourced files |
| `GET /api/general` | Flattened values with `$var` resolved |
| `GET /api/animations` | `beziers[]` + `animations[]` |
| `GET /api/binds` | `binds[]` grouped by modifier |
| `GET /api/variables` | All `$name → raw + resolved` |
| `GET /api/search?q=<query>` | Full-text search across all tokens |
| `GET /api/files` | All `.conf` files in config dir |
| `GET /api/file?path=<abs>` | Raw content of any conf file |
| `GET /api/raw/<main\|animations\|binds\|keybindings>` | Raw content of named files |

## How the parser works

- Tokenizes line-by-line: blanks, comments, section open/close, assignments
- Expands `source = ./sub.conf` directives one level deep
- Extracts `$variable = value` definitions from all tokens
- Resolves `$var` references recursively (up to 8 levels) before returning values
- `chokidar` watches the config dir and invalidates the file cache on disk changes
