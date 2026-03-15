# AI Module — Claude Context

## Purpose
WASM model integration. Receives a user prompt and returns a JSON widget spec.

## Subdirectories
- `prompts/` — Prompt templates. Never hardcode prompts inline in logic files.
- `runtime/` — WASM model loading, initialization, and inference interface.
- `parser/` — Parses and validates the raw model output into a typed JSON widget spec.

## Contract
- **Input**: plain text user prompt
- **Output**: JSON widget spec (see `docs/architecture.md` for schema)

## Guidelines
- This module is stateless — no side effects, no rendering
- The parser must validate the spec before returning it to the base app
- If the model output is malformed, the parser returns a structured error
- Runtime choice is TBD — keep the runtime behind an interface so it can be swapped
