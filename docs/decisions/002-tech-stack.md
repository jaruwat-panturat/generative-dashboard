# ADR 002: Tech Stack

## Status
Accepted

## Decisions

| Layer | Choice |
|-------|--------|
| Framework | Angular (latest) |
| UI Component Library | Angular Material |
| Language | TypeScript |
| AI Runtime | WASM — TBD |
| Persistence | localStorage (browser-native) |
| Build Tool | Angular CLI |

## Consequences

### Project Structure
Angular CLI generates its own `src/app/` convention. Our logical modules (`ai/`, `app/`, `widgets/`, `persistence/`) will map to **Angular services and component libraries** inside `src/app/`:

```
src/
└── app/
    ├── ai/              ← Angular service wrapping the WASM runtime
    ├── orchestrator/    ← Angular service, maps spec → widget registry
    ├── widgets/         ← Angular components (one per widget)
    │   └── dora-metrics/
    │       ├── *.component.ts
    │       ├── *.component.html
    │       └── mock/
    └── persistence/     ← Angular service wrapping localStorage
```

### Widgets
- Each widget is a **standalone Angular component**
- Configured via `@Input()` matching the JSON spec `config` shape
- Angular Material provides the base UI primitives (cards, tables, charts via a charting lib TBD)

### AI Integration
- The WASM model will be wrapped in an Angular `injectable` service (`AIService`)
- Loaded lazily on first prompt to avoid blocking initial render

## Open Decisions
- Charting library (Angular Material does not include charts) — candidates: Apache ECharts (`ngx-echarts`), Chart.js (`ng2-charts`), or D3
- WASM model runtime — TBD
