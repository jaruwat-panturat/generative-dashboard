# Architecture Overview

## System Design

Everything runs client-side. There is no backend inference server.

```
User Prompt
    │
    ▼
┌─────────────────────────────────┐
│          AI App (WASM)          │  ← model runs in the browser
│  - receives user prompt         │
│  - outputs JSON widget spec     │
└────────────────┬────────────────┘
                 │  JSON spec
                 ▼
┌─────────────────────────────────┐
│           Base App              │  ← orchestrator
│  - parses JSON spec             │
│  - maps spec → widget registry  │
│  - saves layout to localStorage │
└────────────────┬────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│   Widget A   │   │   Widget B   │  ← predefined widget set
│  (mock data) │   │  (mock data) │
└──────────────┘   └──────────────┘
```

## Components

### AI App (WASM)
- A language model compiled to WebAssembly, running entirely in the browser
- Receives a user prompt and returns a **JSON widget spec**
- No network call for inference — fully offline-capable
- Model runtime TBD (e.g. llama.cpp/wasm, Transformers.js, MLC-LLM)

### Base App
- The shell/orchestrator
- On first load: renders the default static layout
- On prompt submission: sends prompt to AI App, receives JSON spec, renders widgets
- Saves the current layout (prompt + spec) to **localStorage** for persistence across sessions

### Widgets
- A predefined, finite set of UI components (e.g. line chart, stat card, table, bar chart)
- The AI does not generate new widget code — it selects and configures from the registry
- **Phase 1**: all widgets use mock/static data
- **Phase 2**: widgets gain a datasource config and call `api/ds/query` (Grafana datasource API)

## JSON Widget Spec (draft)
The AI outputs a spec that describes which widgets to render and how to configure them:

```json
{
  "layout": [
    {
      "widget": "LineChart",
      "title": "Revenue over time",
      "config": {
        "xAxis": "date",
        "yAxis": "revenue"
      },
      "datasource": null
    },
    {
      "widget": "StatCard",
      "title": "Total Users",
      "config": {
        "value": 1024
      },
      "datasource": null
    }
  ]
}
```

> `datasource: null` in Phase 1 (mock data). In Phase 2, it will reference a Grafana datasource and query.

## Persistence
- Layout (last prompt + generated spec) saved to **localStorage**
- On reload, base app reads localStorage and restores the last layout without re-running the model

## Data Flow Summary
1. User opens app → base app checks localStorage → renders saved or default layout
2. User enters prompt → sent to WASM model
3. Model returns JSON spec
4. Base app maps spec → widgets from registry
5. Widgets render with mock data
6. Layout saved to localStorage
