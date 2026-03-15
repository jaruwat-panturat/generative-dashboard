# ADR 001: Security Model

## Status
Accepted

## Enforcement
These rules are enforced automatically via `.claude/hooks/security-guardrail.sh`, which runs before every Write/Edit tool call and blocks violations.

## Context
The app runs entirely client-side. A WASM model receives a user prompt and outputs a JSON widget spec. The base app maps that spec to predefined widgets. In Phase 2, widgets will call external datasources (Grafana `api/ds/query`).

Because the AI output is the primary untrusted input that drives rendering, the security boundary must be established early and enforced consistently.

---

## Decisions & Mitigations

### 1. Prompt Injection
**Risk**: A malicious value in the prompt (or future datasource response) injects instructions that cause the model to output a spec referencing unintended widgets or leaking data.

**Mitigation**:
- `src/ai/parser/` must strip or reject any spec entry whose `widget` value is not in the registry whitelist
- Datasource responses (Phase 2) must never be concatenated directly into the prompt — pass them as structured data only

---

### 2. JSON Spec Trust — No Dynamic Execution
**Risk**: The base app blindly trusts AI output and executes or evaluates it.

**Mitigation**:
- Never `eval()`, `new Function()`, or `dangerouslySetInnerHTML` anything from the AI output
- The orchestrator (`src/app/orchestrator/`) must only look up widget names from the registry — unknown names are silently dropped, never executed

---

### 3. WASM Model Supply Chain
**Risk**: Model weights or the WASM runtime are loaded from an external source. A compromised CDN could swap them.

**Mitigation**:
- Use Subresource Integrity (SRI) `integrity` attributes for any externally loaded assets
- Verify checksums of model weight files on load before passing them to the runtime
- Prefer bundling weights locally over loading from a CDN where possible

---

### 4. localStorage Poisoning
**Risk**: If an XSS vulnerability exists on the same origin, an attacker can write a malicious spec to localStorage that gets restored and rendered on next load.

**Mitigation**:
- `src/persistence/` must re-validate the spec against the widget registry whitelist on every read, not just on write
- Treat localStorage data with the same level of trust as AI output — always parse and validate before use

---

### 5. Datasource URL Allowlist (Phase 2)
**Risk**: A crafted spec sets a widget's `datasource` to an arbitrary URL, turning the browser into an unintended HTTP client (browser-side SSRF).

**Mitigation**:
- Datasource targets must be validated against a strict allowlist before any `api/ds/query` call is made
- The allowlist is user-configured and stored separately from the AI-generated spec

---

### 6. SharedArrayBuffer / Spectre (WASM)
**Risk**: If the WASM runtime uses `SharedArrayBuffer` (required by some runtimes for threading), the page must set `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers. These also enable Spectre-class timing attacks on co-located memory.

**Mitigation**:
- Audit the chosen WASM runtime for `SharedArrayBuffer` usage before finalising the runtime choice
- Set `COOP: same-origin` and `COEP: require-corp` headers if required
- Document the decision in a follow-up ADR once the runtime is selected

---

## The Critical Boundary
The **parser** (`src/ai/parser/`) and **registry** (`src/widgets/registry/`) together form the single trust boundary of this application. Everything downstream of this boundary is considered safe. Everything upstream — model output, localStorage, future datasource responses — is considered untrusted.

```
[Untrusted]                        [Trusted]
  AI output  ──►  parser + registry  ──►  orchestrator  ──►  widgets
  localStorage ──►  (re-validate)   ──►  persistence
```

All future security decisions should be evaluated in terms of whether they strengthen or weaken this boundary.
