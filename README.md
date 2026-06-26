# LLM Text Processor

[English](#english) | [中文](#中文)

Long text batch processing tool powered by LLM. Chunk text with intelligent strategies, process via API in parallel or serial mode, with a modern web UI.

Originally a Python/tkinter desktop app, fully rewritten in TypeScript as a Dockerized web service.

> **UI based on [AI-Long-Text-Flow](https://github.com/zlhhhh8901/AI-Long-Text-Flow)** by [zlhhhh8901](https://github.com/zlhhhh8901) — the fragmentation UX, execution engine, and visual design are from this excellent open-source project. Thank you!

---

## English

### Features

- **Multiple chunking strategies**: Chars, Lines, Custom (wildcard/regex/headings)
- **Three execution modes**: Serial, Parallel (configurable concurrency), Serial + Contextual Memory
- **Prompt presets**: Predefined prompt templates via server-side config.json
- **Real-time status**: Per-chunk progress, retry failures, pause/stop anytime
- **Export options**: Results only, source + results, custom format
- **Merge workflow**: Combine results back into input for iterative processing
- **Glossary**: Import terms for consistent translation/customization
- **Data privacy**: API keys stay on the server (backend), not in the browser

### Architecture

```
Browser → Nginx (frontend) → Node.js API (backend) → LLM Provider (OpenAI/DeepSeek/etc)
              :8094                  :8093
```

- **Backend**: Node.js + Express + TypeScript — text splitting, LLM API calling, config management
- **Frontend**: React 19 + Vite + Tailwind CSS — responsive SPA, works on desktop and mobile
- **Infrastructure**: Docker Compose, connects to existing Cloudflare Tunnel for public access

### Quick Start

```bash
# 1. Configure API key via environment variable
# Option A: Create .env file
echo "OPENAI_API_KEY=your-key-here" > .env
echo "OPENAI_BASE_URL=https://opencode.ai/zen/go/v1" >> .env
echo "OPENAI_MODEL=deepseek-v4-flash" >> .env

# Option B: Or copy and edit the config template
cp backend/config.example.json backend/config.json

# 2. Build & start
docker compose up -d

# 3. Open browser
# http://localhost:8094
```

### Configuration

Configure via **environment variables** (recommended, prevents secret leaks):

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your API key | — |
| `OPENAI_BASE_URL` | API base URL | `https://opencode.ai/zen/go/v1` |
| `OPENAI_MODEL` | Model name | `deepseek-v4-flash` |

Or copy `backend/config.example.json` to `backend/config.json` and edit:

```json
{
  "api": {
    "provider": "openai",
    "openai": {
      "api_key": "your-key-here",
      "base_url": "https://opencode.ai/zen/go/v1",
      "model": "deepseek-v4-flash"
    }
  }
}
```

> ⚠️ **Security**: `backend/config.json` is gitignored. Never commit API keys to the repository.

Restart after config changes: `docker restart llm-text-processor-api`

### Project Structure

```
llm-text-processor/
├── backend/                     # REST API
│   ├── src/
│   │   ├── server.ts            # Express routes
│   │   ├── textProcessor.ts     # Text splitting logic
│   │   ├── apiClient.ts         # LLM API caller
│   │   └── config.ts            # Config loader
│   ├── config.json              # API keys, prompts, params
│   ├── Dockerfile
│   └── package.json
├── frontend/                    # React SPA
│   ├── components/              # UI components
│   ├── services/                # API client, splitter, glossary
│   ├── locales/                 # i18n (en/zh)
│   ├── App.tsx                  # Main app logic
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/presets` | Get prompt presets and config |
| POST | `/api/split` | Split text into chunks (no API call) |
| POST | `/api/process` | Split + process all chunks via LLM |
| POST | `/api/process-chunk` | Process a single chunk |
| POST | `/api/reload` | Hot-reload config.json |

---

## 中文

### 功能

- **多策略分块**：按字符/行数/自定义规则（通配符/正则/标题）
- **三种执行模式**：串行、并行（可控并发）、串行+上下文记忆
- **预设提示词**：通过服务端 config.json 管理 prompt 模板
- **实时状态**：逐块进度可视化，失败可重试，随时暂停
- **导出功能**：纯结果/原文对照/自定义格式
- **往返编辑**：结果合并回输入区，迭代处理
- **术语表**：导入术语确保翻译一致性
- **隐私安全**：API Key 存储在服务端，浏览器不接触

### 快速开始

```bash
# 1. 配置 API key（推荐使用环境变量，避免密钥泄露）
echo "OPENAI_API_KEY=你的-key" > .env

# 或者复制配置模板后编辑
cp backend/config.example.json backend/config.json

# 2. 构建并启动
docker compose up -d

# 3. 打开浏览器
# http://localhost:8094
```

### 致谢

- 前端 UI 基于 [AI-Long-Text-Flow](https://github.com/zlhhhh8901/AI-Long-Text-Flow) by [zlhhhh8901](https://github.com/zlhhhh8901)
- 原始 Python 版本由 fengyuwang-com 开发

### 许可证

MIT
