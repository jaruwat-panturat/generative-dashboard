# Generative Dashboard — Claude Context

## Project Overview
A fully client-side dashboard. A WASM-based AI model receives a user prompt and outputs a JSON widget spec. The base app maps that spec to a predefined set of widgets and renders them.

## Tech Stack
- **Framework**: Angular (latest, standalone components)
- **UI Library**: Angular Material
- **Language**: TypeScript
- **AI Runtime**: WASM — TBD
- **Persistence**: localStorage
- **Build**: Angular CLI

## Three Main Components

### 1. AI App (WASM)
- A language model running in the browser via WebAssembly
- Wrapped in an Angular `AIService` (`src/app/ai/`)
- Input: user prompt → Output: JSON widget spec
- Loaded lazily on first prompt

### 2. Base App
- Angular app shell + `OrchestratorService`
- Parses JSON spec, maps it to the widget registry, triggers render
- Saves layout to localStorage via `PersistenceService`
- On first load: renders default static layout

### 3. Widgets
- Standalone Angular components, one per widget type
- Configured via `@Input()` matching the JSON spec `config` shape
- Angular Material for UI primitives
- Charting library TBD
- Phase 1: mock data | Phase 2: Grafana `api/ds/query`

## Key Modules
| Path | Purpose |
|------|---------|
| `src/app/ai/` | WASM model service + prompt templates + parser |
| `src/app/orchestrator/` | Maps JSON spec → widget registry |
| `src/app/widgets/` | Standalone widget components + mock data |
| `src/app/persistence/` | localStorage service |

## JSON Widget Spec
The contract between AI and base app. See `docs/architecture.md`.

## Security
All rules enforced via `.claude/hooks/security-guardrail.sh`. See `docs/decisions/001-security-model.md`.

## Open Decisions
- Charting library (candidates: `ngx-echarts`, `ng2-charts`, D3)
- WASM model runtime

## Development Guidelines
- Use standalone components — no NgModules
- All localStorage access goes through `PersistenceService` only
- All prompts live in `src/app/ai/prompts/`
- Widget `@Input()` config shape must match the JSON spec — keep them in sync
- New widgets must be registered in the widget registry before the AI can reference them
