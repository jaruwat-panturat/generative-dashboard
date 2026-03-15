/// <reference lib="webworker" />
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

let generator: any = null;

async function loadModel(modelId: string): Promise<void> {
  generator = await pipeline('text-generation', modelId, {
    dtype: 'q4' as any,
    progress_callback: (info: any) => {
      postMessage({ type: 'progress', payload: info });
    },
  });
  postMessage({ type: 'ready' });
}

async function generate(messages: any[], maxNewTokens: number): Promise<void> {
  if (!generator) throw new Error('Model not loaded');

  console.log('[worker] generate called');
  const output = (await generator(messages, { max_new_tokens: maxNewTokens })) as any[];

  const generated = output[0]?.generated_text;
  const text: string = Array.isArray(generated)
    ? (generated.at(-1)?.content ?? '')
    : (generated ?? '');

  console.log('[worker] result:', text.slice(0, 300));
  postMessage({ type: 'result', payload: text });
}

addEventListener('message', async (event: MessageEvent) => {
  const { type, payload } = event.data;
  try {
    if (type === 'load') {
      await loadModel(payload.modelId);
    } else if (type === 'generate') {
      await generate(payload.messages, payload.maxNewTokens);
    }
  } catch (err) {
    postMessage({ type: 'error', payload: String(err) });
  }
});
