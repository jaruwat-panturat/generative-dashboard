# Widgets Module — Claude Context

## Purpose
Predefined, finite set of UI widget components. The AI selects and configures these — it never generates new widget code at runtime.

## Subdirectories
- `registry/` — Maps widget names (as used in the JSON spec) to their component implementations.
- `common/` — Shared utilities, types, and base styles used across widgets.
- Each widget gets its own subdirectory: `widgets/<WidgetName>/`

## Widget Structure
Each widget directory contains:
```
widgets/
└── LineChart/
    ├── index       ← component entry point
    ├── mock        ← mock data for Phase 1
    └── types       ← prop types / config schema
```

## Datasource (Phase 2)
When ready, each widget will also contain:
```
    └── datasource  ← Grafana api/ds/query integration
```

## Guidelines
- Every widget must be registered in `registry/` before the AI can reference it by name
- Phase 1: all widgets render from their own `mock` data file
- Phase 2: if `datasource` is set in the spec, the widget calls `api/ds/query` instead of mock
- Widget config shape must match what the AI is prompted to produce — keep prompts and widget types in sync
