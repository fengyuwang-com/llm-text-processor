import * as fs from 'fs';
import * as path from 'path';

export interface AppConfig {
  server: { port: number; maxFileSize: number };
  api: {
    provider: 'deepseek' | 'openai';
    deepseek: { api_key: string; base_url: string; model: string };
    openai: { api_key: string; base_url: string; model: string };
  };
  model_params: {
    max_tokens: number;
    temperature: number;
    max_concurrent_requests: number;
  };
  text_processing: {
    mode: 'sentence' | 'paragraph';
    max_chars_per_chunk: number;
    overlap_paragraphs: number;
  };
  prompts: {
    current_prompt: string;
    available_prompts: Record<string, {
      name: string;
      description: string;
      template: string;
    }>;
  };
}

let config: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (config) return config;
  const configPath = process.env.CONFIG_PATH || path.join(__dirname, '..', 'config.json');

  let raw: AppConfig;
  if (fs.existsSync(configPath)) {
    raw = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as AppConfig;
  } else {
    raw = {
      server: { port: 5000, maxFileSize: 10485760 },
      api: {
        provider: 'openai',
        deepseek: { api_key: '', base_url: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
        openai: { api_key: '', base_url: 'https://opencode.ai/zen/go/v1', model: 'deepseek-v4-flash' },
      },
      model_params: { max_tokens: 4096, temperature: 0.7, max_concurrent_requests: 5 },
      text_processing: { mode: 'paragraph', max_chars_per_chunk: 2000, overlap_paragraphs: 0 },
      prompts: { current_prompt: '', available_prompts: {} },
    };
  }

  // Allow environment variables to override API keys (safer than config.json)
  if (process.env.OPENAI_API_KEY) raw.api.openai.api_key = process.env.OPENAI_API_KEY;
  if (process.env.OPENAI_BASE_URL) raw.api.openai.base_url = process.env.OPENAI_BASE_URL;
  if (process.env.OPENAI_MODEL) raw.api.openai.model = process.env.OPENAI_MODEL;
  if (process.env.DEEPSEEK_API_KEY) raw.api.deepseek.api_key = process.env.DEEPSEEK_API_KEY;

  config = raw;
  return config;
}

export function reloadConfig(): AppConfig {
  config = null;
  return loadConfig();
}
