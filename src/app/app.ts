import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DoraMetricCardComponent, DoraMetricKey } from './widgets/dora-metric-card/dora-metric-card.component';
import { DoraMetricsService } from './widgets/dora-metrics/dora-metrics.service';
import { DoraTeamDataset } from './widgets/dora-metrics/dora-metrics.types';
import { AIService } from './ai/ai.service';
import { OrchestratorService } from './orchestrator/orchestrator.service';
import { parseWidgetSpec } from './ai/parser/spec.parser';
import { AIStatus, ResolvedWidget } from './ai/ai.types';

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
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    DoraMetricCardComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  // Static mode
  teams: TeamSelection[] = [];
  readonly metricKeys: DoraMetricKey[] = [
    'deployment_frequency',
    'lead_time_for_changes',
    'change_failure_rate',
    'time_to_restore',
  ];

  // AI mode
  promptInput = '';
  aiStatus: AIStatus = 'idle';
  loadingProgress = 0;
  loadingFile = '';
  resolvedWidgets: ResolvedWidget[] = [];
  isAILayout = false;
  errorMessage = '';

  constructor(
    private doraService: DoraMetricsService,
    private aiService: AIService,
    private orchestrator: OrchestratorService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.teams = this.doraService.getAll().map((dataset, index) => ({
      dataset,
      selected: index === 0,
    }));

    this.aiService.status$.subscribe(s => { this.aiStatus = s; this.cdr.detectChanges(); });
    this.aiService.loadingProgress$.subscribe(p => { this.loadingProgress = p; this.cdr.detectChanges(); });
    this.aiService.loadingFile$.subscribe(f => { this.loadingFile = f; this.cdr.detectChanges(); });
  }

  get selectedDatasets(): DoraTeamDataset[] {
    return this.teams.filter(t => t.selected).map(t => t.dataset);
  }

  get isBusy(): boolean {
    return this.aiStatus === 'loading' || this.aiStatus === 'generating';
  }

  onPromptSubmit(): void {
    const prompt = this.promptInput.trim();
    if (!prompt || this.isBusy) return;
    this.errorMessage = '';

    if (this.aiStatus === 'idle') {
      this.aiService.initialize().subscribe({
        next: () => this.runGeneration(prompt),
        error: err => { this.errorMessage = String(err); this.cdr.detectChanges(); },
      });
    } else if (this.aiStatus === 'ready') {
      this.runGeneration(prompt);
    }
  }

  private runGeneration(prompt: string): void {
    this.aiService.generate(prompt).subscribe({
      next: raw => {
        try {
          const spec = parseWidgetSpec(raw);
          this.resolvedWidgets = this.orchestrator.resolve(spec);
          this.isAILayout = true;
        } catch (err) {
          this.errorMessage = `Could not parse layout: ${err}`;
        }
        this.cdr.detectChanges();
      },
      error: err => { this.errorMessage = String(err); this.cdr.detectChanges(); },
    });
  }

  resetToStatic(): void {
    this.isAILayout = false;
    this.resolvedWidgets = [];
    this.promptInput = '';
    this.errorMessage = '';
  }
}
