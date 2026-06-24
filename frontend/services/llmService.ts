const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface LLMSession {
  promptName: string;
}

export const initializeSession = (_config?: { promptName: string }): LLMSession => {
  return { promptName: _config?.promptName || 'humorous_rewrite' };
};

export const processChunkWithLLM = async (
  text: string,
  config?: { promptName?: string; temperature?: number; maxTokens?: number },
  _session?: LLMSession
): Promise<string> => {
  const body: any = { text };
  if (config?.promptName) body.promptName = config.promptName;
  if (config?.temperature !== undefined) body.temperature = config.temperature;
  if (config?.maxTokens !== undefined) body.maxTokens = config.maxTokens;

  const res = await fetch(`${API_BASE}/process-chunk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.result || '';
};

export const splitText = async (text: string, splitConfig: any): Promise<any[]> => {
  const res = await fetch(`${API_BASE}/split`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      mode: splitConfig.mode === 'character' ? 'paragraph' : splitConfig.mode,
      maxChars: splitConfig.chunkSize || splitConfig.maxChars || 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.chunks.map((c: any) => ({
    id: c.id,
    index: c.index,
    rawContent: c.rawContent,
    status: 0,
  }));
};

export const loadPresets = async () => {
  const res = await fetch(`${API_BASE}/presets`);
  if (!res.ok) throw new Error('Failed to load presets');
  return res.json();
};
