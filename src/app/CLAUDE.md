# App Module — Claude Context

## Purpose
Base app shell and orchestration. Coordinates between the AI module, widget registry, and persistence layer.

## Subdirectories
- `layout/` — Default static layout rendered on first load (before any prompt is submitted).
- `orchestrator/` — Receives JSON spec from AI, maps it to widgets, triggers render.

## Responsibilities
1. On first load: check localStorage for a saved layout — restore it or fall back to default
2. On prompt submit: call `src/ai/` → receive JSON spec → pass to orchestrator
3. Orchestrator maps each spec entry to a widget from the registry
4. Save resulting layout to localStorage via `src/persistence/`

## Guidelines
- The app shell owns the top-level render cycle
- It does not know about widget internals — only widget names and configs from the spec
- All localStorage access goes through `src/persistence/`, not directly from here
