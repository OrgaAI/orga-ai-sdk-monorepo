# orga-ai

The Orga AI Backend SDK for Python - simplifies API integration for server-side applications by abstracting away the complexity of fetching ephemeral tokens and ICE servers.

---

## Project Overview

- **Purpose:** Provide a clean, simple interface for Python backend applications to fetch Orga AI session configuration
- **Platform:** Python 3.8+ (supports FastAPI, Django, Flask, and other Python frameworks)
- **Architecture:** Eliminates manual API calls, error handling, and response parsing

---

## Installation

Install the SDK from PyPI:

```bash
pip install orga-ai
```

Or if you prefer using pip with dependencies:

```bash
pip install orga-ai[dev]  # Includes development dependencies
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

### 2. Basic Usage (Async)

```python
import asyncio
import os
from orga_ai import OrgaAI, OrgaAIConfig

async def main():
    # Initialize the client
    config = OrgaAIConfig(
        api_key=os.getenv("ORGA_API_KEY"),
        user_email=os.getenv("ORGA_USER_EMAIL")
    )
    
    async with OrgaAI(config) as client:
        # Get session configuration
        session_config = await client.get_session_config()
        print(f"Token: {session_config.ephemeral_token}")
        print(f"ICE servers: {session_config.ice_servers}")

# Run the async function
asyncio.run(main())
```

### 3. Basic Usage (Sync)

```python
import os
from orga_ai import OrgaAIConfig, get_session_config_sync

# Initialize configuration
config = OrgaAIConfig(
    api_key=os.getenv("ORGA_API_KEY"),
    user_email=os.getenv("ORGA_USER_EMAIL")
)

# Get session configuration (synchronous)
session_config = get_session_config_sync(config)
print(f"Token: {session_config.ephemeral_token}")
print(f"ICE servers: {session_config.ice_servers}")
```

### 4. FastAPI Example

```python
from fastapi import FastAPI, HTTPException
from orga_ai import OrgaAI, OrgaAIConfig
import os

app = FastAPI()

# Initialize the client
config = OrgaAIConfig(
    api_key=os.getenv("ORGA_API_KEY"),
    user_email=os.getenv("ORGA_USER_EMAIL")
)

@app.get("/api/orga-session")
async def get_orga_session():
    try:
        async with OrgaAI(config) as client:
            session_config = await client.get_session_config()
            return {
                "ephemeral_token": session_config.ephemeral_token,
                "ice_servers": [
                    {
                        "urls": server.urls,
                        "username": server.username,
                        "credential": server.credential
                    }
                    for server in session_config.ice_servers
                ]
            }
    except Exception as error:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get session config: {str(error)}"
        )
```

### 5. Django Example

```python
# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from orga_ai import OrgaAIConfig, get_session_config_sync
import os

@csrf_exempt
@require_http_methods(["GET"])
def orga_session_view(request):
    try:
        config = OrgaAIConfig(
            api_key=os.getenv("ORGA_API_KEY"),
            user_email=os.getenv("ORGA_USER_EMAIL")
        )
        
        session_config = get_session_config_sync(config)
        return JsonResponse({
            "ephemeral_token": session_config.ephemeral_token,
            "ice_servers": [
                {
                    "urls": server.urls,
                    "username": server.username,
                    "credential": server.credential
                }
                for server in session_config.ice_servers
            ]
        })
    except Exception as error:
        return JsonResponse(
            {"error": f"Failed to get session config: {str(error)}"},
            status=500
        )
```

### 6. Flask Example

```python
from flask import Flask, jsonify
from orga_ai import OrgaAIConfig, get_session_config_sync
import os

app = Flask(__name__)

@app.route("/api/orga-session", methods=["GET"])
def get_orga_session():
    try:
        config = OrgaAIConfig(
            api_key=os.getenv("ORGA_API_KEY"),
            user_email=os.getenv("ORGA_USER_EMAIL")
        )
        
        session_config = get_session_config_sync(config)
        return jsonify({
            "ephemeral_token": session_config.ephemeral_token,
            "ice_servers": [
                {
                    "urls": server.urls,
                    "username": server.username,
                    "credential": server.credential
                }
                for server in session_config.ice_servers
            ]
        })
    except Exception as error:
        return jsonify(
            {"error": f"Failed to get session config: {str(error)}"}
        ), 500
```

### 7. Frontend Integration

Your frontend can now use the session configuration:

```javascript
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
```python
import httpx
import json

# 40+ lines of manual API code
api_url = f"https://api.orga-ai.com/v1/realtime/client-secrets?email={user_email}"
response = await httpx.post(api_url, headers={
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
})
data = response.json()
ephemeral_token = data["ephemeral_token"]

# Fetch ICE servers
ice_url = "https://api.orga-ai.com/v1/realtime/ice-config"
ice_response = await httpx.get(ice_url, headers={
    "Authorization": f"Bearer {ephemeral_token}"
})
ice_data = ice_response.json()
ice_servers = ice_data["iceServers"]
# ... error handling, response parsing, etc.
```

### **After (With Backend SDK):**
```python
from orga_ai import OrgaAI, OrgaAIConfig

# Simple, clean interface
config = OrgaAIConfig(api_key=api_key, user_email=user_email)
async with OrgaAI(config) as client:
    session_config = await client.get_session_config()
```

---

## Configuration

The `OrgaAIConfig` class accepts the following configuration options:

| Option | Type | Description | Default | Required? |
|--------|------|-------------|---------|-----------|
| `api_key` | `str` | Your OrgaAI API key | — | Yes |
| `user_email` | `str` | Developer's email address | — | Yes |
| `base_url` | `str` | OrgaAI API base URL | `https://api.orga-ai.com` | No |
| `timeout` | `int` | Request timeout in milliseconds | `10000` | No |
| `debug` | `bool` | Enable debug logging | `False` | No |

### Example Configuration

```python
config = OrgaAIConfig(
    api_key=os.getenv("ORGA_API_KEY"),
    user_email=os.getenv("ORGA_USER_EMAIL"),
    base_url="https://api.orga-ai.com",
    timeout=30000,  # 30 seconds
    debug=True  # Enable debug logging
)
```

---

## API Reference

### `OrgaAI(config: OrgaAIConfig)`

Creates a new OrgaAI client instance.

**Parameters:**
- `config.api_key` (str): Your Orga AI API key
- `config.user_email` (str): Developer's email address  
- `config.base_url` (str, optional): Orga AI API base URL
- `config.timeout` (int, optional): Request timeout in milliseconds
- `config.debug` (bool, optional): Enable debug logging

### `get_session_config()`

Returns session configuration needed for WebRTC connection.

**Returns:** `SessionConfig`
- `ephemeral_token`: Temporary token for WebRTC authentication
- `ice_servers`: List of ICE servers for WebRTC connection

**Example:**
```python
async with OrgaAI(config) as client:
    session_config = await client.get_session_config()
    # Returns: SessionConfig(ephemeral_token="token123", ice_servers=[...])
```

---

## Error Handling

The SDK provides custom error classes for different types of failures:

```python
from orga_ai import (
    OrgaAI, 
    OrgaAIConfig,
    OrgaAIError, 
    OrgaAIAuthenticationError, 
    OrgaAIServerError 
)

try:
    config = OrgaAIConfig(api_key=api_key, user_email=user_email)
    async with OrgaAI(config) as client:
        session_config = await client.get_session_config()
except OrgaAIAuthenticationError as error:
    print(f'Authentication failed: {error.message}')
    # Handle invalid API key or user email
except OrgaAIServerError as error:
    print(f'Server error: {error.message}')
    # Handle API server errors
except OrgaAIError as error:
    print(f'OrgaAI error: {error.message}')
    # Handle other OrgaAI-specific errors
except Exception as error:
    print(f'Unknown error: {error}')
    # Handle unexpected errors
```

### Error Types

- **`OrgaAIError`**: Base error class for all OrgaAI errors
- **`OrgaAIAuthenticationError`**: Invalid API key or user email (401)
- **`OrgaAIServerError`**: Server errors (500, 502, 503, etc.)

---

## Advanced Usage

### Custom Base URL

For different environments or regions:

```python
config = OrgaAIConfig(
    api_key=os.getenv("ORGA_API_KEY"),
    user_email=os.getenv("ORGA_USER_EMAIL"),
    base_url="https://api-staging.orga-ai.com"  # Custom endpoint
)
```

### Debug Logging

Enable detailed logging for development:

```python
config = OrgaAIConfig(
    api_key=os.getenv("ORGA_API_KEY"),
    user_email=os.getenv("ORGA_USER_EMAIL"),
    debug=True  # Enables console logging
)

async with OrgaAI(config) as client:
    session_config = await client.get_session_config()

# Will log:
# [OrgaAI] Fetching session config
# [OrgaAI] Fetched ephemeral token: token123
# [OrgaAI] Fetched ICE servers: [...]
```

### Custom Timeout

Handle slow network conditions:

```python
config = OrgaAIConfig(
    api_key=os.getenv("ORGA_API_KEY"),
    user_email=os.getenv("ORGA_USER_EMAIL"),
    timeout=60000  # 60 seconds
)
```

---

## Framework Examples

### FastAPI with Dependency Injection

```python
from fastapi import FastAPI, Depends, HTTPException
from orga_ai import OrgaAI, OrgaAIConfig
import os

app = FastAPI()

def get_orga_client():
    config = OrgaAIConfig(
        api_key=os.getenv("ORGA_API_KEY"),
        user_email=os.getenv("ORGA_USER_EMAIL"),
        timeout=30000,
        debug=os.getenv("DEBUG") == "true"
    )
    return OrgaAI(config)

@app.get("/api/orga-session")
async def get_orga_session(client: OrgaAI = Depends(get_orga_client)):
    try:
        session_config = await client.get_session_config()
        return {
            "ephemeral_token": session_config.ephemeral_token,
            "ice_servers": [
                {
                    "urls": server.urls,
                    "username": server.username,
                    "credential": server.credential
                }
                for server in session_config.ice_servers
            ]
        }
    except Exception as error:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get session config: {str(error)}"
        )
```

### Django with Class-Based Views

```python
# views.py
from django.views.generic import View
from django.http import JsonResponse
from orga_ai import OrgaAIConfig, get_session_config_sync
import os

class OrgaSessionView(View):
    def get(self, request):
        try:
            config = OrgaAIConfig(
                api_key=os.getenv("ORGA_API_KEY"),
                user_email=os.getenv("ORGA_USER_EMAIL")
            )
            
            session_config = get_session_config_sync(config)
            return JsonResponse({
                "ephemeral_token": session_config.ephemeral_token,
                "ice_servers": [
                    {
                        "urls": server.urls,
                        "username": server.username,
                        "credential": server.credential
                    }
                    for server in session_config.ice_servers
                ]
            })
        except Exception as error:
            return JsonResponse(
                {"error": f"Failed to get session config: {str(error)}"},
                status=500
            )
```

### Flask with Blueprint

```python
from flask import Blueprint, jsonify
from orga_ai import OrgaAIConfig, get_session_config_sync
import os

orga_bp = Blueprint('orga', __name__, url_prefix='/api')

@orga_bp.route('/orga-session', methods=['GET'])
def get_orga_session():
    try:
        config = OrgaAIConfig(
            api_key=os.getenv("ORGA_API_KEY"),
            user_email=os.getenv("ORGA_USER_EMAIL")
        )
        
        session_config = get_session_config_sync(config)
        return jsonify({
            "ephemeral_token": session_config.ephemeral_token,
            "ice_servers": [
                {
                    "urls": server.urls,
                    "username": server.username,
                    "credential": server.credential
                }
                for server in session_config.ice_servers
            ]
        })
    except Exception as error:
        return jsonify(
            {"error": f"Failed to get session config: {str(error)}"}
        ), 500
```

---

## Type Hints and IDE Support

The SDK is fully typed and provides excellent IDE support:

```python
from orga_ai import OrgaAI, OrgaAIConfig, SessionConfig, IceServer

# Full type hints
config: OrgaAIConfig = OrgaAIConfig(
    api_key=os.getenv("ORGA_API_KEY"),
    user_email=os.getenv("ORGA_USER_EMAIL")
)

async with OrgaAI(config) as client:
    session_config: SessionConfig = await client.get_session_config()
    # session_config.ephemeral_token: str
    # session_config.ice_servers: List[IceServer]
```

---

## Testing

The SDK includes comprehensive test coverage and can be easily mocked in your tests:

```python
# tests/test_orga_integration.py
import pytest
from unittest.mock import AsyncMock, patch
from orga_ai import OrgaAI, OrgaAIConfig, SessionConfig, IceServer

class TestOrgaAIIntegration:
    @pytest.mark.asyncio
    async def test_session_config_retrieval(self):
        # Mock the SDK
        mock_session_config = SessionConfig(
            ephemeral_token="test-token",
            ice_servers=[
                IceServer(urls="stun:stun1.l.google.com:19302")
            ]
        )
        
        with patch('orga_ai.OrgaAI') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.get_session_config.return_value = mock_session_config
            mock_client_class.return_value.__aenter__.return_value = mock_client
            
            config = OrgaAIConfig(
                api_key="test-key",
                user_email="test@example.com"
            )
            
            async with OrgaAI(config) as client:
                result = await client.get_session_config()
                
            assert result.ephemeral_token == "test-token"
            assert len(result.ice_servers) == 1
```

---

## Development

### Running Tests

```bash
# Install development dependencies
pip install orga-ai[dev]

# Run tests
pytest

# Run tests with coverage
pytest --cov=orga_ai

# Run specific test file
pytest tests/test_client.py
```

### Code Formatting

```bash
# Format code with black
black src/

# Sort imports with isort
isort src/

# Lint with ruff
ruff check src/
```

### Type Checking

```bash
# Run mypy type checker
mypy src/
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

5. **"RuntimeError: asyncio.run() cannot be called from a running event loop"**
   - Use the async context manager instead of the sync wrapper
   - Or use `get_session_config_sync()` in non-async contexts

### Debug Mode

Enable debug logging to see detailed information:

```python
config = OrgaAIConfig(
    api_key=os.getenv("ORGA_API_KEY"),
    user_email=os.getenv("ORGA_USER_EMAIL"),
    debug=True  # Enable debug logging
)
```

This will show you the complete request/response flow, making it easier to identify issues.

---

## Security Best Practices

1. **Never expose API keys in client code**
2. **Use environment variables for sensitive data**
3. **Implement proper error handling**
4. **Add rate limiting to your endpoints**
5. **Use HTTPS in production**
6. **Validate user input on your backend**

---

## Python Version Support

The SDK supports Python 3.8 and above. Key features by version:

- **Python 3.8+**: Full async/await support, type hints
- **Python 3.9+**: Built-in generic types (`list[str]` instead of `List[str]`)
- **Python 3.10+**: Union syntax (`str | None` instead of `Optional[str]`)

---

## Support

For issues or questions, please refer to the SDK documentation or contact the Orga AI team.

---

## License

This SDK is proprietary software. See the LICENSE file for details.
