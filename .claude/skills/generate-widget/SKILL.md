# Skill: generate-widget

Scaffold a new AI-generated widget from a user prompt.

## Usage
```
/generate-widget <description>
```

## What this skill does
1. Takes a natural language description of a widget
2. Creates the widget component file in `src/components/dynamic/`
3. Wires it up to the generator renderer
4. Adds any required data-fetching hooks

## Example
```
/generate-widget "a line chart showing revenue over the last 30 days"
```

## Output
- `src/components/dynamic/<WidgetName>.tsx`
- Updates `src/generator/renderer/registry.ts` with the new widget
