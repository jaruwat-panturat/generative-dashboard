import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DoraMetricCardComponent, DoraMetricKey } from './widgets/dora-metric-card/dora-metric-card.component';
import { DoraMetricsService } from './widgets/dora-metrics/dora-metrics.service';
import { DoraTeamDataset } from './widgets/dora-metrics/dora-metrics.types';

interface TeamSelection {
  dataset: DoraTeamDataset;
  selected: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatCheckboxModule,
    DoraMetricCardComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  teams: TeamSelection[] = [];

  readonly metricKeys: DoraMetricKey[] = [
    'deployment_frequency',
    'lead_time_for_changes',
    'change_failure_rate',
    'time_to_restore',
  ];

  constructor(private doraService: DoraMetricsService) {}

  ngOnInit(): void {
    this.teams = this.doraService.getAll().map((dataset, index) => ({
      dataset,
      selected: index === 0, // only first team selected by default
    }));
  }

  get selectedDatasets(): DoraTeamDataset[] {
    return this.teams.filter(t => t.selected).map(t => t.dataset);
  }
}
