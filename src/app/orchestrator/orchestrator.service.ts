import { Injectable } from '@angular/core';
import { WidgetSpec, ResolvedWidget } from '../ai/ai.types';
import { WIDGET_REGISTRY } from '../widgets/widget.registry';
import { DoraMetricsService } from '../widgets/dora-metrics/dora-metrics.service';

@Injectable({ providedIn: 'root' })
export class OrchestratorService {
  constructor(private doraService: DoraMetricsService) {}

  resolve(spec: WidgetSpec): ResolvedWidget[] {
    return spec.widgets
      .map((entry, index) => {
        const component = WIDGET_REGISTRY[entry.type];
        if (!component) return null;

        const inputs = this.resolveInputs(entry.type, entry.config);
        if (!inputs) return null;

        return { id: `${entry.type}-${index}`, component, inputs };
      })
      .filter((w): w is ResolvedWidget => w !== null);
  }

  private resolveInputs(
    type: string,
    config: Record<string, unknown>,
  ): Record<string, any> | null {
    if (type === 'dora-metric-card') {
      const dataset = this.doraService.getById(config['teamId'] as string);
      if (!dataset) return null;
      return { metricKey: config['metricKey'], dataset };
    }
    return null;
  }
}
