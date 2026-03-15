import { Injectable } from '@angular/core';
import { DoraTeamDataset } from './dora-metrics.types';

import teamAlpha from '../../../widgets/DoraMetrics/mock/team-alpha.json';
import teamBeta from '../../../widgets/DoraMetrics/mock/team-beta.json';
import teamGamma from '../../../widgets/DoraMetrics/mock/team-gamma.json';

@Injectable({ providedIn: 'root' })
export class DoraMetricsService {
  private datasets: DoraTeamDataset[] = [
    teamAlpha as DoraTeamDataset,
    teamBeta as DoraTeamDataset,
    teamGamma as DoraTeamDataset,
  ];

  getAll(): DoraTeamDataset[] {
    return this.datasets;
  }

  getById(id: string): DoraTeamDataset | undefined {
    return this.datasets.find((d) => d.team.id === id);
  }
}
