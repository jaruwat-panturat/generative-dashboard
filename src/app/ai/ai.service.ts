import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject, filter, take, map } from 'rxjs';
import { AIStatus, WorkerMessage } from './ai.types';
import { buildMessages } from './prompts/widget-spec.prompt';

export const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';

@Injectable({ providedIn: 'root' })
export class AIService {
  private worker: Worker | null = null;
  private messages$ = new Subject<WorkerMessage>();

  readonly status$ = new BehaviorSubject<AIStatus>('idle');
  readonly loadingProgress$ = new BehaviorSubject<number>(0);
  readonly loadingFile$ = new BehaviorSubject<string>('');

  constructor(private zone: NgZone) {}

  initialize(): Observable<void> {
    if (this.worker) {
      return new Observable(obs => {
        obs.next();
        obs.complete();
      });
    }

    this.worker = new Worker(new URL('./ai.worker', import.meta.url), { type: 'module' });

    // Worker messages arrive outside Angular's zone — bring them back in so
    // change detection fires on every emission.
    this.worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      this.zone.run(() => this.messages$.next(e.data));
    };
    this.worker.onerror = (e: ErrorEvent) => {
      this.zone.run(() =>
        this.messages$.next({ type: 'error', payload: e.message ?? 'Worker crashed' }),
      );
    };

    this.status$.next('loading');
    this.worker.postMessage({ type: 'load', payload: { modelId: MODEL_ID } });

    // Track bytes loaded/total per file so progress is aggregate, not per-file.
    const fileBytes = new Map<string, { loaded: number; total: number }>();

    this.messages$.pipe(filter(m => m.type === 'progress')).subscribe(m => {
      const p = m.payload;
      if (!p) return;

      if (p.file) this.loadingFile$.next(p.file);

      if (p.status === 'progress') {
        if (p.loaded != null && p.total > 0) {
          // Aggregate bytes across all files for a smooth overall bar
          fileBytes.set(p.file, { loaded: p.loaded, total: p.total });
          const totalLoaded = [...fileBytes.values()].reduce((s, f) => s + f.loaded, 0);
          const totalSize = [...fileBytes.values()].reduce((s, f) => s + f.total, 0);
          this.loadingProgress$.next(Math.round((totalLoaded / totalSize) * 100));
        } else if (p.progress != null) {
          // No Content-Length from server — use per-file % as fallback
          this.loadingProgress$.next(Math.round(p.progress));
        }
      }
    });

    return this.messages$.pipe(
      filter(m => m.type === 'ready' || m.type === 'error'),
      take(1),
      map(m => {
        if (m.type === 'error') {
          this.status$.next('error');
          throw new Error(m.payload);
        }
        this.status$.next('ready');
        this.loadingProgress$.next(100);
      }),
    );
  }

  /** Emits each token as it streams, then completes when generation finishes. */
  generate(userPrompt: string): Observable<string> {
    this.status$.next('generating');
    const messages = buildMessages(userPrompt);
    this.worker!.postMessage({ type: 'generate', payload: { messages, maxNewTokens: 256 } });

    return new Observable<string>(observer => {
      const sub = this.messages$
        .pipe(filter(m => m.type === 'token' || m.type === 'result' || m.type === 'error'))
        .subscribe(m => {
          if (m.type === 'token') {
            observer.next(m.payload as string);
          } else if (m.type === 'result') {
            this.status$.next('ready');
            observer.next(m.payload as string);
            observer.complete();
          } else {
            this.status$.next('ready');
            observer.error(new Error(m.payload));
          }
        });
      return () => sub.unsubscribe();
    });
  }
}
