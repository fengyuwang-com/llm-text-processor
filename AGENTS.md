# Agent Guide for LLM Text Processor

## Project Overview
Full-stack TypeScript rewrite of the original Python llm-text-processor. Long text chunking + LLM processing via REST API, with a React frontend based on AI-Long-Text-Flow.

## Architecture
- `backend/` — Node.js + Express + TypeScript REST API
- `frontend/` — React + Vite + Tailwind (CDN) SPA
- `docker-compose.yml` — runs both containers on `fengnas_nas_net`

## Backend
- **Port**: 5000 (internal), mapped to 8093 on host
- **Framework**: Express, TypeScript, compiled with `tsc`
- **Key files**:
  - `src/server.ts` — routes: `/api/health`, `/api/presets`, `/api/split`, `/api/process`, `/api/process-chunk`, `/api/reload`
  - `src/textProcessor.ts` — text splitting logic (sentence/paragraph modes, ported from Python original)
  - `src/apiClient.ts` — OpenAI-compatible LLM API caller with retry + concurrency
  - `src/config.ts` — config.json loader with hot-reload
- **Config**: `backend/config.json` — API keys, model params, prompt templates
- **Build**: `npx tsc` -> `dist/`

## Frontend
- **Framework**: React 19, Vite 6, Tailwind CSS (via CDN script tag in index.html)
- **UI based on**: [AI-Long-Text-Flow](https://github.com/zlhhhh8901/AI-Long-Text-Flow) by zlhhhh8901
- **Key differences from original**:
  - `services/llmService.ts` calls backend API instead of direct LLM providers
  - `components/ApiKeyModal.tsx` simplified to backend URL config only
  - `components/Sidebar.tsx` added prompt preset selector from backend config
- **Build**: `npm run build` -> `dist/` (copied into nginx Docker image)

## Docker
- `backend/Dockerfile` — multi-stage: node:24-alpine builder -> node:24-alpine runner
- `frontend/Dockerfile` — copies pre-built `dist/` into nginx:alpine
- `frontend/nginx.conf` — serves static files, proxies `/api/` to backend
- External network `fengnas_nas_net` required (from the main FengNAS stack)

## Development
```bash
# Backend
cd backend && npm run dev    # tsx watch for hot-reload

# Frontend
cd frontend && npm run dev   # Vite dev server, proxies /api to localhost:5000
```

## Common Tasks
- **Add a new prompt preset**: edit `backend/config.json` -> `prompts.available_prompts`
- **Change API provider/key**: edit `backend/config.json` -> `api`
- **Rebuild backend after code changes**: `docker compose build llm-text-processor-api && docker compose up -d`
- **Rebuild frontend after UI changes**: `cd frontend && npm run build && cd .. && docker compose build llm-text-processor-web && docker compose up -d`
- **Restart with new config** (no rebuild needed): `docker restart llm-text-processor-api`

## API Endpoints
- `GET /api/health` — health check
- `GET /api/presets` — available prompts and current config
- `POST /api/split` — split text into chunks without API call
- `POST /api/process` — split + process all chunks in parallel
- `POST /api/process-chunk` — process a single chunk (for serial/streaming mode)
- `POST /api/reload` — hot-reload config.json
