# OrgaAI Python Backend

A FastAPI backend that uses the OrgaAI Python SDK to provide session configuration for WebRTC connections.

## Overview

This backend serves as a replacement for the Node.js SDK in the Next.js frontend. Instead of using the `@orga-ai/node` package directly in the Next.js app, the frontend calls this Python backend which uses our new `orga-ai` Python SDK.

## Architecture

```
Next.js Frontend (localhost:3000)
    ↓ HTTP Request
Python FastAPI Backend (localhost:8000)
    ↓ Uses SDK
OrgaAI Python SDK
    ↓ API Calls
OrgaAI API
```

## Setup

### 1. Install Dependencies

```bash
cd apps/python-backend
pip install -r requirements.txt
```

### 2. Environment Variables

Copy the example environment file and fill in your values:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
REALTIME_USER_TOKEN=your_actual_api_key_here
REALTIME_USER_EMAIL=your_actual_email@example.com
DEBUG=true
```

### 3. Run the Backend

```bash
python main.py
```

The server will start at `http://localhost:8000`

## API Endpoints

### `GET /api/orga-session`

Returns session configuration for WebRTC connections.

**Response:**
```json
{
  "ephemeralToken": "token_123",
  "iceServers": [
    {
      "urls": "stun:stun1.l.google.com:19302",
      "username": null,
      "credential": null
    }
  ]
}
```

### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "sdk": "orga-ai-python",
  "environment": {
    "api_key_set": true,
    "user_email_set": true,
    "debug_mode": false
  }
}
```

### `GET /`

Root endpoint with basic info.

## Development

### Auto-reload

The server runs with auto-reload enabled, so changes to the code will automatically restart the server.

### Debug Mode

Set `DEBUG=true` in your `.env` file to enable debug logging from the Python SDK.

### API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Integration with Next.js

The Next.js frontend should be updated to call this Python backend instead of using the Node.js SDK directly.

**Before (Node.js SDK):**
```typescript
// examples/next/app/api/route.ts
import { OrgaAI } from "@orga-ai/node";
const orgaAI = new OrgaAI({ apiKey, userEmail });
const sessionConfig = await orgaAI.getSessionConfig();
```

**After (Python Backend):**
```typescript
// examples/next/app/api/route.ts
const response = await fetch('http://localhost:8000/api/orga-session');
const sessionConfig = await response.json();
```

## Error Handling

The backend handles all the same error cases as the Node.js SDK:

- **401**: Authentication errors (invalid API key or email)
- **500**: Server errors (API issues, network problems)
- **500**: Configuration errors (missing environment variables)

## Logging

The backend provides detailed logging:

- Startup/shutdown messages
- API request/response logging (when debug mode is enabled)
- Error logging with context
- Health check status

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use proper secret management
2. **HTTPS**: Enable SSL/TLS
3. **CORS**: Configure allowed origins for your domain
4. **Logging**: Set up proper log aggregation
5. **Monitoring**: Add health checks and metrics
6. **Scaling**: Use a production ASGI server like Gunicorn with Uvicorn workers

Example production command:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
