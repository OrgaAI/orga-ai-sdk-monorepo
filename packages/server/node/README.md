# @orga-ai/node

The Orga AI Backend SDK for Node.js - simplifies API integration for server-side applications by abstracting away the complexity of fetching ephemeral tokens and ICE servers.

---

## Project Overview

- **Purpose:** Provide a clean, simple interface for backend applications to fetch Orga AI session configuration
- **Platform:** Node.js (supports Express, Next.js, Fastify, and other Node.js frameworks)
- **Architecture:** Eliminates manual API calls, error handling, and response parsing

---

## Installation

Install the SDK from npm:

```sh
npm install @orga-ai/node
```

---

## Quick Start

Get up and running in minutes with a complete working example:

### 1. Set Up Environment Variables

Create a `.env` file in your project root:

```env
ORGA_API_KEY=your_orga_api_key_here
ORGA_USER_EMAIL=developer@example.com
```

> **Note:** Get your API key from the Orga AI dashboard. Never commit this file to version control.

### 2. Basic Usage

```typescript
import { OrgaAI } from '@orga-ai/node';

const orgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY,
  userEmail: process.env.ORGA_USER_EMAIL
});

// Get session configuration
const sessionConfig = await orgaAI.getSessionConfig();
// Returns: { ephemeralToken: string, iceServers: IceServer[] }
```

### 3. Next.js API Route

```typescript
// app/api/orga-session/route.ts
import { OrgaAI } from '@orga-ai/node';
import { NextResponse } from 'next/server';

const orgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY!,
  userEmail: process.env.ORGA_USER_EMAIL!
});

export async function GET() {
  try {
    const sessionConfig = await orgaAI.getSessionConfig();
    return NextResponse.json(sessionConfig);
  } catch (error) {
    console.error('OrgaAI error:', error);
    return NextResponse.json(
      { error: 'Failed to get session config' }, 
      { status: 500 }
    );
  }
}
```

### 4. Express.js Example

```typescript
// routes/orga.js
import { OrgaAI } from '@orga-ai/node';
import express from 'express';

const app = express();
const orgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY,
  userEmail: process.env.ORGA_USER_EMAIL
});

app.get('/api/orga-session', async (req, res) => {
  try {
    const sessionConfig = await orgaAI.getSessionConfig();
    res.json(sessionConfig);
  } catch (error) {
    console.error('OrgaAI error:', error);
    res.status(500).json({ error: 'Failed to get session config' });
  }
});
```

### 5. Frontend Integration

Your frontend can now use the session configuration:

```typescript
// Frontend - React/Next.js
import { OrgaAI } from '@orga-ai/react';

// Initialize with your backend endpoint
OrgaAI.init({
  sessionConfigEndpoint: '/api/orga-session' // Your backend endpoint
});

// In your component
function MyComponent() {
  const { startSession, connectionState } = useOrgaAI();
  
  // The frontend SDK automatically:
  // 1. Calls your backend endpoint
  // 2. Gets ephemeralToken and iceServers
  // 3. Establishes WebRTC connection
  // 4. Handles all the complexity
  
  return (
    <button onClick={startSession}>
      {connectionState === "connected" ? 'End Call' : 'Start Call'}
    </button>
  );
}
```

---

## Why the Backend SDK?

The Orga AI Backend SDK eliminates the need to write manual API integration code. Instead of 40+ lines of boilerplate, you get a simple, clean interface.

### **Before (Manual API Calls):**
```typescript
// 40+ lines of manual API code
const apiUrl = `https://api.orga-ai.com/v1/realtime/client-secrets?email=${encodeURIComponent("user@example.com")}`;
const ephemeralResponse = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REALTIME_USER_TOKEN}`,
    },
});
const data = await ephemeralResponse.json();
const iceServers = await fetchIceServers(data.ephemeral_token);
// ... error handling, response parsing, etc.
```

### **After (With Backend SDK):**
```typescript
// Simple, clean interface
const orgaAI = new OrgaAI({ apiKey, userEmail });
const sessionConfig = await orgaAI.getSessionConfig();
```

---

## Configuration

The `OrgaAI` constructor accepts the following configuration options:

| Option | Type | Description | Default | Required? |
|--------|------|-------------|---------|-----------|
| `apiKey` | `string` | Your OrgaAI API key | — | Yes |
| `userEmail` | `string` | Developer's email address | — | Yes |
| `baseUrl` | `string` | OrgaAI API base URL | `https://api.orga-ai.com` | No |
| `timeout` | `number` | Request timeout in milliseconds | `10000` | No |
| `debug` | `boolean` | Enable debug logging | `false` | No |

### Example Configuration

```typescript
const orgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY,
  userEmail: process.env.ORGA_USER_EMAIL,
  baseUrl: 'https://api.orga-ai.com',
  timeout: 30000, // 30 seconds
  debug: true // Enable debug logging
});
```

---

## API Reference

### `new OrgaAI(config)`

Creates a new OrgaAI client instance.

**Parameters:**
- `config.apiKey` (string): Your Orga AI API key
- `config.userEmail` (string): Developer's email address  
- `config.baseUrl` (string, optional): Orga AI API base URL
- `config.timeout` (number, optional): Request timeout in milliseconds
- `config.debug` (boolean, optional): Enable debug logging

### `getSessionConfig()`

Returns session configuration needed for WebRTC connection.

**Returns:** `Promise<SessionConfig>`
- `ephemeralToken`: Temporary token for WebRTC authentication
- `iceServers`: ICE servers for WebRTC connection

**Example:**
```typescript
const sessionConfig = await orgaAI.getSessionConfig();
// Returns: { ephemeralToken: "token123", iceServers: [...] }
```

---

## Error Handling

The SDK provides custom error classes for different types of failures:

```typescript
import { 
  OrgaAI, 
  OrgaAIError, 
  OrgaAIAuthenticationError, 
  OrgaAIServerError 
} from '@orga-ai/node';

try {
  const sessionConfig = await orgaAI.getSessionConfig();
} catch (error) {
  if (error instanceof OrgaAIAuthenticationError) {
    console.error('Authentication failed:', error.message);
    // Handle invalid API key or user email
  } else if (error instanceof OrgaAIServerError) {
    console.error('Server error:', error.message);
    // Handle API server errors
  } else if (error instanceof OrgaAIError) {
    console.error('OrgaAI error:', error.message);
    // Handle other OrgaAI-specific errors
  } else {
    console.error('Unknown error:', error);
    // Handle unexpected errors
  }
}
```

### Error Types

- **`OrgaAIError`**: Base error class for all OrgaAI errors
- **`OrgaAIAuthenticationError`**: Invalid API key or user email (401)
- **`OrgaAIServerError`**: Server errors (500, 502, 503, etc.)

---

## Advanced Usage

### Custom Base URL

For different environments or regions:

```typescript
const orgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY,
  userEmail: process.env.ORGA_USER_EMAIL,
  baseUrl: 'https://api-staging.orga-ai.com' // Custom endpoint
});
```

### Debug Logging

Enable detailed logging for development:

```typescript
const orgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY,
  userEmail: process.env.ORGA_USER_EMAIL,
  debug: true // Enables console logging
});

// Will log:
// [OrgaAI] Fetching session config
// [OrgaAI] Fetched ephemeral token: token123
// [OrgaAI] Fetched ICE servers: [...]
```

### Custom Timeout

Handle slow network conditions:

```typescript
const orgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY,
  userEmail: process.env.ORGA_USER_EMAIL,
  timeout: 60000 // 60 seconds
});
```

---

## Framework Examples

### Next.js App Router

```typescript
// app/api/orga-session/route.ts
import { OrgaAI } from '@orga-ai/node';
import { NextRequest, NextResponse } from 'next/server';

const orgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY!,
  userEmail: process.env.ORGA_USER_EMAIL!,
  timeout: 30000,
  debug: process.env.NODE_ENV === 'development'
});

export async function GET(request: NextRequest) {
  try {
    const sessionConfig = await orgaAI.getSessionConfig();
    return NextResponse.json(sessionConfig);
  } catch (error) {
    console.error('OrgaAI error:', error);
    return NextResponse.json(
      { error: 'Failed to get session config' }, 
      { status: 500 }
    );
  }
}
```

### Express.js with Middleware

```typescript
// middleware/orga.js
import { OrgaAI } from '@orga-ai/node';

const orgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY,
  userEmail: process.env.ORGA_USER_EMAIL
});

export const orgaSessionHandler = async (req, res, next) => {
  try {
    const sessionConfig = await orgaAI.getSessionConfig();
    req.orgaSession = sessionConfig;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session config' });
  }
};

// routes/orga.js
app.get('/api/orga-session', orgaSessionHandler, (req, res) => {
  res.json(req.orgaSession);
});
```

### Fastify

```typescript
// plugins/orga.js
import { OrgaAI } from '@orga-ai/node';

const orgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY,
  userEmail: process.env.ORGA_USER_EMAIL
});

export default async function orgaPlugin(fastify) {
  fastify.get('/api/orga-session', async (request, reply) => {
    try {
      const sessionConfig = await orgaAI.getSessionConfig();
      return sessionConfig;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to get session config' });
    }
  });
}
```

---

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { OrgaAI, SessionConfig, IceServer } from '@orga-ai/node';

const orgaAI: OrgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY!,
  userEmail: process.env.ORGA_USER_EMAIL!
});

const sessionConfig: SessionConfig = await orgaAI.getSessionConfig();
// sessionConfig.ephemeralToken: string
// sessionConfig.iceServers: IceServer[]
```

---

## Testing

The SDK includes comprehensive test coverage and can be easily mocked in your tests:

```typescript
// __tests__/orga.test.ts
import { OrgaAI } from '@orga-ai/node';

// Mock the SDK
jest.mock('@orga-ai/node');

describe('OrgaAI Integration', () => {
  it('should return session config', async () => {
    const mockSessionConfig = {
      ephemeralToken: 'test-token',
      iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }]
    };

    (OrgaAI as jest.MockedClass<typeof OrgaAI>).mockImplementation(() => ({
      getSessionConfig: jest.fn().mockResolvedValue(mockSessionConfig)
    }));

    const orgaAI = new OrgaAI({
      apiKey: 'test-key',
      userEmail: 'test@example.com'
    });

    const result = await orgaAI.getSessionConfig();
    expect(result).toEqual(mockSessionConfig);
  });
});
```

---

## Troubleshooting

### Common Issues

1. **"API key is required"**
   - Ensure `ORGA_API_KEY` environment variable is set
   - Check that the API key is valid

2. **"Invalid email format"**
   - Verify `ORGA_USER_EMAIL` is a valid email address
   - Check for typos in the email format

3. **"Failed to fetch ephemeral token"**
   - Check your internet connection
   - Verify the API key has the correct permissions
   - Check if the Orga AI API is experiencing issues

4. **Timeout errors**
   - Increase the timeout value if you have slow network
   - Check for network connectivity issues

### Debug Mode

Enable debug logging to see detailed information:

```typescript
const orgaAI = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY,
  userEmail: process.env.ORGA_USER_EMAIL,
  debug: true // Enable debug logging
});
```

This will show you the complete request/response flow, making it easier to identify issues.

---

## Security Best Practices

1. **Never expose API keys in client code**
2. **Use environment variables for sensitive data**
3. **Implement proper error handling**
4. **Add rate limiting to your endpoints**
5. **Use HTTPS in production**

---

## Support

For issues or questions, please refer to the SDK documentation or contact the Orga AI team.

---