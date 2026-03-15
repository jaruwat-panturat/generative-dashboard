#!/bin/bash
# Security guardrail — runs on PreToolUse (Write/Edit) to catch violations before they land.
# Based on ADR 001: docs/decisions/001-security-model.md

FILE="$1"
CONTENT="$2"

ERRORS=()

# 1. No dynamic execution of AI output
if echo "$CONTENT" | grep -qE 'eval\(|new Function\(|dangerouslySetInnerHTML'; then
  ERRORS+=("SECURITY: eval/new Function/dangerouslySetInnerHTML is forbidden — never execute AI output directly (ADR 001 §2)")
fi

# 2. localStorage must only be accessed inside src/persistence/
if echo "$CONTENT" | grep -qE 'localStorage\.' && [[ "$FILE" != *"src/persistence/"* ]]; then
  ERRORS+=("SECURITY: localStorage access is only allowed inside src/persistence/ (ADR 001 §4). Use the persistence module instead.")
fi

# 3. Prompts must live in src/ai/prompts/ — no hardcoded prompt strings in logic files
if echo "$CONTENT" | grep -qE '(system_prompt|systemPrompt|SYSTEM_PROMPT)\s*=' && [[ "$FILE" != *"src/ai/prompts/"* ]]; then
  ERRORS+=("SECURITY: Prompt strings must live in src/ai/prompts/, not inline in logic files (ADR 001 §1)")
fi

# 4. Datasource URLs must not be taken directly from the AI spec without validation (Phase 2 guard)
if echo "$CONTENT" | grep -qE 'api/ds/query' && ! echo "$CONTENT" | grep -qiE 'allowlist|whitelist|validate'; then
  ERRORS+=("SECURITY: api/ds/query calls must reference an allowlist/validate before use (ADR 001 §5)")
fi

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║           Security Guardrail — ADR 001               ║"
  echo "╚══════════════════════════════════════════════════════╝"
  for err in "${ERRORS[@]}"; do
    echo "  ✖ $err"
  done
  echo ""
  echo "See docs/decisions/001-security-model.md for context."
  echo ""
  exit 1
fi

exit 0
