import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DoraTeamDataset, DoraLevel, DoraMetric } from '../dora-metrics/dora-metrics.types';

export type DoraMetricKey =
  | 'deployment_frequency'
  | 'lead_time_for_changes'
  | 'change_failure_rate'
  | 'time_to_restore';

@Component({
  selector: 'app-dora-metric-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTooltipModule],
  templateUrl: './dora-metric-card.component.html',
  styleUrl: './dora-metric-card.component.scss',
})
export class DoraMetricCardComponent {
  @Input({ required: true }) metricKey!: DoraMetricKey;
  @Input({ required: true }) dataset!: DoraTeamDataset;

  readonly levelColor: Record<DoraLevel, string> = {
    elite:  '#00c853',
    high:   '#64b5f6',
    medium: '#ffb300',
    low:    '#ef5350',
  };

  readonly levelLabel: Record<DoraLevel, string> = {
    elite:  'Elite',
    high:   'High',
    medium: 'Medium',
    low:    'Low',
  };

  readonly metricTitle: Record<DoraMetricKey, string> = {
    deployment_frequency:  'Deployment Frequency',
    lead_time_for_changes: 'Lead Time for Changes',
    change_failure_rate:   'Change Failure Rate',
    time_to_restore:       'Time to Restore Service',
  };

  private readonly lowerIsBetter: DoraMetricKey[] = [
    'lead_time_for_changes',
    'change_failure_rate',
    'time_to_restore',
  ];

  get title(): string {
    return this.metricTitle[this.metricKey];
  }

  get metric(): DoraMetric {
    return this.dataset.metrics[this.metricKey];
  }

  getLevelColor(level: DoraLevel): string {
    return this.levelColor[level];
  }

  get trend(): 'up' | 'down' | 'flat' {
    const points = this.metric.trend;
    if (points.length < 2) return 'flat';
    const first = points[0].value;
    const last = points[points.length - 1].value;
    if (Math.abs(last - first) / (first || 1) < 0.03) return 'flat';
    if (this.lowerIsBetter.includes(this.metricKey)) {
      return last < first ? 'up' : 'down';
    }
    return last > first ? 'up' : 'down';
  }

  get trendIcon(): string {
    return this.trend === 'up' ? '↑' : this.trend === 'down' ? '↓' : '→';
  }

  get trendClass(): string {
    return `trend-${this.trend}`;
  }

  get sparklinePath(): string {
    const values = this.metric.trend.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 160, h = 40, pad = 2;
    const points = values.map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }
}
