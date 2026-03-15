import { Type } from '@angular/core';
import { DoraMetricCardComponent } from './dora-metric-card/dora-metric-card.component';

export const WIDGET_REGISTRY: Record<string, Type<any>> = {
  'dora-metric-card': DoraMetricCardComponent,
};
