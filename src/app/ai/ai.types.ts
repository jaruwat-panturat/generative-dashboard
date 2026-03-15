import { Type } from '@angular/core';

export interface WidgetEntry {
  type: string;
  config: Record<string, unknown>;
}

export interface WidgetSpec {
  widgets: WidgetEntry[];
}

export interface ResolvedWidget {
  id: string;
  component: Type<any>;
  inputs: Record<string, any>;
}

export type AIStatus = 'idle' | 'loading' | 'ready' | 'generating' | 'error';

export interface WorkerMessage {
  type: 'progress' | 'ready' | 'token' | 'result' | 'error';
  payload?: any;
}
