"""OrgaAI Python SDK - Backend SDK for server-side applications.

This package provides a clean, simple interface for Python backend applications
to integrate with OrgaAI's realtime communication services.

The SDK abstracts away the complexity of fetching ephemeral tokens and ICE servers,
making it easy to set up WebRTC connections from your backend.

Example:
    ```python
    from orga_ai import OrgaAI, OrgaAIConfig
    
    # Initialize the client
    config = OrgaAIConfig(
        api_key="your_api_key",
        user_email="developer@example.com"
    )
    client = OrgaAI(config)
    
    # Get session configuration
    session_config = await client.get_session_config()
    print(f"Token: {session_config.ephemeral_token}")
    print(f"ICE servers: {session_config.ice_servers}")
    ```
"""

from .client import OrgaAI, get_session_config_sync
from .types import OrgaAIConfig, SessionConfig, IceServer
from .errors import (
    OrgaAIError,
    OrgaAIAuthenticationError,
    OrgaAIServerError,
)

# Version information
__version__ = "1.0.0-beta.1"

# Public API - what users can import
__all__ = [
    # Main client class
    "OrgaAI",
    
    # Configuration and types
    "OrgaAIConfig",
    "SessionConfig", 
    "IceServer",
    
    # Error classes
    "OrgaAIError",
    "OrgaAIAuthenticationError",
    "OrgaAIServerError",
    
    # Convenience functions
    "get_session_config_sync",
    
    # Version
    "__version__",
]
