import express from 'express';
import cors from 'cors';
import { loadConfig, reloadConfig } from './config';
import { chunkText, splitIntoSentences, splitIntoParagraphs } from './textProcessor';
import { ApiClient } from './apiClient';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Get presets (available prompts and config)
app.get('/api/presets', (_req, res) => {
  try {
    const config = loadConfig();
    res.json({
      prompts: config.prompts.available_prompts,
      current_prompt: config.prompts.current_prompt,
      text_processing: config.text_processing,
      model_params: {
        temperature: config.model_params.temperature,
        max_tokens: config.model_params.max_tokens,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Just split text, no API call
app.post('/api/split', (req, res) => {
  try {
    const { text, mode, maxChars, overlap } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const config = loadConfig();
    const chunks = chunkText(text, {
      mode: mode || config.text_processing.mode,
      maxChars: maxChars || config.text_processing.max_chars_per_chunk,
      overlap: overlap !== undefined ? overlap : config.text_processing.overlap_paragraphs,
    });

    const items = chunks.map((content, i) => ({
      id: `chunk-${i + 1}`,
      index: i + 1,
      rawContent: content,
    }));

    res.json({ chunks: items, total: items.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Process text with LLM
app.post('/api/process', async (req, res) => {
  try {
    const { text, promptName, temperature, maxTokens, mode, maxChars, overlap } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const config = loadConfig();

    // Determine which prompt template to use
    let promptKey = promptName || config.prompts.current_prompt;
    const promptDef = config.prompts.available_prompts[promptKey];
    if (!promptDef) return res.status(400).json({ error: `Unknown prompt: ${promptKey}` });

    // Split text into chunks
    const chunks = chunkText(text, {
      mode: mode || config.text_processing.mode,
      maxChars: maxChars || config.text_processing.max_chars_per_chunk,
      overlap: overlap !== undefined ? overlap : config.text_processing.overlap_paragraphs,
    });

    // Create prompts for each chunk
    const prompts = chunks.map(chunk => promptDef.template.replace('{input_text}', chunk));

    // Update model params if provided
    const modelParams = { ...config.model_params };
    if (temperature !== undefined) modelParams.temperature = temperature;
    if (maxTokens !== undefined) modelParams.max_tokens = maxTokens;

    // Call API
    const client = new ApiClient(config.api as any, modelParams);
    const results = await client.batchCall(prompts);

    const items = chunks.map((content, i) => ({
      id: `chunk-${i + 1}`,
      index: i + 1,
      rawContent: content,
      result: results[i] || '',
      status: results[i] ? 'success' : 'error',
    }));

    res.json({ chunks: items, total: items.length, promptName: promptKey });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Process single chunk (for serial/streaming mode)
app.post('/api/process-chunk', async (req, res) => {
  try {
    const { text, promptName, temperature, maxTokens } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const config = loadConfig();
    let promptKey = promptName || config.prompts.current_prompt;
    const promptDef = config.prompts.available_prompts[promptKey];
    if (!promptDef) return res.status(400).json({ error: `Unknown prompt: ${promptKey}` });

    const prompt = promptDef.template.replace('{input_text}', text);
    const modelParams = { ...config.model_params };
    if (temperature !== undefined) modelParams.temperature = temperature;
    if (maxTokens !== undefined) modelParams.max_tokens = maxTokens;

    const client = new ApiClient(config.api as any, modelParams);
    const result = await client.callAPI(prompt);

    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reload config
app.post('/api/reload', (_req, res) => {
  try {
    reloadConfig();
    res.json({ status: 'ok' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || loadConfig().server.port;
app.listen(PORT, () => {
  console.log(`LLM Text Processor API running on port ${PORT}`);
});
