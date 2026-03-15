import { WidgetSpec, WidgetEntry } from '../ai.types';

const VALID_WIDGET_TYPES = new Set(['dora-metric-card']);

const VALID_METRIC_KEYS = new Set([
  'deployment_frequency',
  'lead_time_for_changes',
  'change_failure_rate',
  'time_to_restore',
]);

const ALL_TEAM_IDS = ['team-alpha', 'team-beta', 'team-gamma'];
const VALID_TEAM_IDS = new Set(ALL_TEAM_IDS);

export function parseWidgetSpec(raw: string): WidgetSpec {
  const json = extractJson(raw);
  const cleaned = cleanJson(json);
  const parsed = JSON.parse(cleaned);

  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.widgets)) {
    throw new Error('Invalid spec: missing "widgets" array');
  }

  const widgets: WidgetEntry[] = (parsed.widgets as any[])
    .flatMap(w => expandTeam(w))
    .filter(w => {
      if (!w || !VALID_WIDGET_TYPES.has(w.type)) return false;
      const c = w.config ?? {};
      return VALID_METRIC_KEYS.has(c.metricKey) && VALID_TEAM_IDS.has(c.teamId);
    })
    .map(w => ({ type: w.type as string, config: w.config as Record<string, unknown> }));

  if (widgets.length === 0) {
    throw new Error('No valid widgets in spec');
  }

  return { widgets };
}

/** Expand teamId "all" into one entry per team. */
function expandTeam(w: any): any[] {
  if (w?.config?.teamId === 'all') {
    return ALL_TEAM_IDS.map(teamId => ({
      ...w,
      config: { ...w.config, teamId },
    }));
  }
  return [w];
}

/** Fix common model JSON mistakes before parsing. */
function cleanJson(text: string): string {
  // Model sometimes wraps array objects in extra quotes: },"{"  →  },{
  return text.replace(/\},\s*"(\s*\{)/g, '},$1');
}

function extractJson(text: string): string {
  // Strip markdown code fences
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();

  // Find the first { then walk forward matching braces, ignoring braces inside strings.
  const start = text.indexOf('{');
  if (start === -1) throw new Error('No JSON found in model output');

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}' && --depth === 0) return text.slice(start, i + 1);
  }

  throw new Error('Incomplete JSON in model output');
}
