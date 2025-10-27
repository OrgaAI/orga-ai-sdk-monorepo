"""FastAPI backend that uses the OrgaAI Python SDK.

This backend provides a REST API endpoint that the Next.js frontend can call
to get session configuration for WebRTC connections.
"""

import os
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import our local SDK
from orga_ai import OrgaAI, OrgaAIConfig, OrgaAIError, OrgaAIAuthenticationError, OrgaAIServerError

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup/shutdown events."""
    # Startup
    print("🚀 Python FastAPI backend starting up...")
    print("📦 Using OrgaAI Python SDK")
    yield
    # Shutdown
    print("👋 Python FastAPI backend shutting down...")


# Create FastAPI app
app = FastAPI(
    title="OrgaAI Python Backend",
    description="Backend API that uses the OrgaAI Python SDK to provide session configuration",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware to allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development server
        "http://localhost:3001",  # Alternative Next.js port
        "https://localhost:3000",  # HTTPS version
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


def get_orga_client() -> OrgaAI:
    """Create and return an OrgaAI client instance.
    
    This function reads environment variables and creates a configured client.
    It's equivalent to the client creation in the Node.js route.ts file.
    """
    api_key = os.getenv("REALTIME_USER_TOKEN")
    user_email = os.getenv("REALTIME_USER_EMAIL")
    
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="REALTIME_USER_TOKEN environment variable is not set"
        )
    
    if not user_email:
        raise HTTPException(
            status_code=500,
            detail="REALTIME_USER_EMAIL environment variable is not set"
        )
    
    config = OrgaAIConfig(
        api_key=api_key,
        user_email=user_email,
        debug=os.getenv("DEBUG", "false").lower() == "true"
    )
    
    return OrgaAI(config)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "OrgaAI Python Backend is running!",
        "version": "1.0.0",
        "sdk": "orga-ai-python"
    }


@app.get("/api/orga-session")
async def get_orga_session():
    """Get OrgaAI session configuration.
    
    This endpoint is equivalent to the Next.js API route but uses the Python SDK.
    It returns the same data structure that the frontend expects.
    """
    try:
        # Create OrgaAI client (equivalent to the Node.js version)
        orga_client = get_orga_client()
        
        # Get session configuration using our Python SDK
        async with orga_client as client:
            session_config = await client.get_session_config()
            
            # Convert to the format expected by the frontend
            return {
                "ephemeralToken": session_config.ephemeral_token,
                "iceServers": [
                    {
                        "urls": server.urls,
                        "username": server.username,
                        "credential": server.credential
                    }
                    for server in session_config.ice_servers
                ]
            }
            
    except OrgaAIAuthenticationError as error:
        print(f"❌ Authentication error: {error.message}")
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {error.message}"
        )
        
    except OrgaAIServerError as error:
        print(f"❌ Server error: {error.message}")
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {error.message}"
        )
        
    except OrgaAIError as error:
        print(f"❌ OrgaAI error: {error.message}")
        raise HTTPException(
            status_code=500,
            detail=f"OrgaAI error: {error.message}"
        )
        
    except Exception as error:
        print(f"❌ Unexpected error: {str(error)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch session config: {str(error)}"
        )


@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring."""
    try:
        # Test that we can create a client (without making API calls)
        get_orga_client()
        return {
            "status": "healthy",
            "sdk": "orga-ai-python",
            "environment": {
                "api_key_set": bool(os.getenv("REALTIME_USER_TOKEN")),
                "user_email_set": bool(os.getenv("REALTIME_USER_EMAIL")),
                "debug_mode": os.getenv("DEBUG", "false").lower() == "true"
            }
        }
    except Exception as error:
        return {
            "status": "unhealthy",
            "error": str(error)
        }


if __name__ == "__main__":
    import uvicorn
    
    print("🐍 Starting OrgaAI Python Backend...")
    print("📡 Server will be available at: http://localhost:8000")
    print("🔗 API endpoint: http://localhost:8000/api/orga-session")
    print("📊 API docs: http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
