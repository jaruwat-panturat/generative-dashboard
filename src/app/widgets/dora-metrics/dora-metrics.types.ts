export type DoraLevel = 'elite' | 'high' | 'medium' | 'low';

export interface TrendPoint {
  week: string;
  value: number;
}

export interface DoraMetric {
  label: string;
  value: number;
  unit: string;
  dora_level: DoraLevel;
  trend: TrendPoint[];
}

export interface DoraMetrics {
  deployment_frequency: DoraMetric;
  lead_time_for_changes: DoraMetric;
  change_failure_rate: DoraMetric;
  time_to_restore: DoraMetric;
}

export interface DoraTeamDataset {
  team: {
    id: string;
    name: string;
    description: string;
  };
  period: {
    from: string;
    to: string;
    label: string;
  };
  dora_level: DoraLevel;
  metrics: DoraMetrics;
}
