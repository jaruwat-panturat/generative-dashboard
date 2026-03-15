# Generative Dashboard — Claude Context

## Project Overview
A fully client-side dashboard. A WASM-based AI model receives a user prompt and outputs a JSON widget spec. The base app maps that spec to a predefined set of widgets and renders them.

## Three Main Components

### 1. AI App (WASM)
- A language model running in the browser via WebAssembly
- Input: user prompt
- Output: JSON widget spec (which widgets to show + their config)
- No backend inference — fully client-side
- Runtime TBD

### 2. Base App
- Orchestrates the full flow
- Parses JSON spec from AI and maps it to the widget registry
- Saves layout to localStorage for persistence across sessions
- On first load: renders default static layout

### 3. Widgets
- Predefined, finite set of UI components
- AI selects and configures widgets — it does NOT generate new widget code
- Phase 1: mock/static data
- Phase 2: datasource config calling `api/ds/query` (Grafana datasource API)

## Key Modules
| Path | Purpose |
|------|---------|
| `src/ai/` | WASM model integration, prompt → JSON spec |
| `src/app/` | Base app shell and orchestration logic |
| `src/widgets/` | Predefined widget registry and components |
| `src/persistence/` | localStorage read/write for layout saving |

## JSON Widget Spec
The contract between the AI App and the Base App. See `docs/architecture.md` for the draft schema.

## Datasource (Phase 2)
Widgets will support a `datasource` field that references a Grafana datasource and issues queries via `api/ds/query`. Start with `datasource: null` (mock data).

## Development Guidelines
- The AI outputs a spec — it never generates widget code at runtime
- All widgets must be registered in the widget registry before the AI can use them
- Prompt templates live in `src/ai/prompts/` — never hardcode them inline
- Schema changes to the JSON spec require an ADR in `docs/decisions/`
