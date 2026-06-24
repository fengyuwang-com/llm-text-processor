export interface ApiConfig {
  provider: 'deepseek' | 'openai';
  deepseek: { api_key: string; base_url: string; model: string };
  openai: { api_key: string; base_url: string; model: string };
}

export interface ModelParams {
  max_tokens: number;
  temperature: number;
  max_concurrent_requests: number;
}

export class ApiClient {
  private provider: 'deepseek' | 'openai';
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private maxRetries = 3;
  private retryDelay = 2;

  constructor(config: ApiConfig, private modelParams: ModelParams) {
    this.provider = config.provider;
    const pc = config[config.provider];
    if (!pc) throw new Error(`Provider "${config.provider}" not configured`);
    this.apiKey = pc.api_key;
    this.baseUrl = pc.base_url;
    this.model = pc.model;
  }

  async callAPI(prompt: string, retryCount = 0): Promise<string> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/chat/completions`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
    const body = {
      model: this.model,
      messages: [{ role: 'user' as const, content: prompt }],
      max_tokens: this.modelParams.max_tokens,
      temperature: this.modelParams.temperature,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error ${res.status}: ${text}`);
      }

      const data: any = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      if (retryCount < this.maxRetries) {
        const wait = this.retryDelay * (retryCount + 1);
        console.log(`Retry ${retryCount + 1}/${this.maxRetries} after ${wait}s: ${err.message}`);
        await new Promise(r => setTimeout(r, wait * 1000));
        return this.callAPI(prompt, retryCount + 1);
      }
      throw new Error(`API call failed after ${this.maxRetries} retries: ${err.message}`);
    }
  }

  async batchCall(prompts: string[]): Promise<string[]> {
    const semaphore = this.modelParams.max_concurrent_requests;
    const results: string[] = [];

    const limitedCall = async (prompt: string, idx: number) => {
      results[idx] = await this.callAPI(prompt);
    };

    const queue = prompts.map((p, i) => ({ prompt: p, idx: i }));
    for (let i = 0; i < queue.length; i += semaphore) {
      const batch = queue.slice(i, i + semaphore);
      await Promise.all(batch.map(b => limitedCall(b.prompt, b.idx)));
    }

    return results;
  }
}
