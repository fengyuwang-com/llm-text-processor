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
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as AppConfig;
  return config;
}

export function reloadConfig(): AppConfig {
  config = null;
  return loadConfig();
}
