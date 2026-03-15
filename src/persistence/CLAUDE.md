# Persistence Module — Claude Context

## Purpose
localStorage adapter. Saves and restores the current dashboard layout (prompt + JSON spec) across sessions.

## Stored Entities
| Key | Value | Description |
|-----|-------|-------------|
| `dashboard:layout` | JSON widget spec | The last AI-generated layout |
| `dashboard:prompt` | string | The prompt that produced the layout |

## Guidelines
- All localStorage access in the app goes through this module — never read/write localStorage directly elsewhere
- Keep the stored shape versioned so future schema changes can be migrated gracefully
- This module has no knowledge of widgets or AI — it only stores and retrieves raw JSON
