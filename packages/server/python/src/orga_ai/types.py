"""Type definitions for OrgaAI Python SDK.

This module contains all the type definitions and data models used throughout the SDK.
These are equivalent to TypeScript interfaces but implemented using Python dataclasses
and Pydantic models for runtime validation.
"""

from typing import List, Optional, Union
from dataclasses import dataclass


@dataclass
class OrgaAIConfig:
    """Configuration options for the OrgaAI client.
    
    This is equivalent to the OrgaAIConfig interface in TypeScript.
    
    Attributes:
        api_key: Your OrgaAI API key (required)
        user_email: Developer's email address (required)
        base_url: OrgaAI API base URL (optional, defaults to https://api.orga-ai.com)
        debug: Enable debug logging (optional, defaults to False)
        timeout: Request timeout in milliseconds (optional, defaults to 10000)
    """
    api_key: str
    user_email: str
    base_url: Optional[str] = None
    debug: Optional[bool] = None
    timeout: Optional[int] = None


@dataclass
class SessionConfig:
    """Session configuration returned by getSessionConfig().
    
    This is equivalent to the SessionConfig interface in TypeScript.
    
    Attributes:
        ephemeral_token: Temporary token for WebRTC authentication
        ice_servers: List of ICE servers for WebRTC connection
    """
    ephemeral_token: str
    ice_servers: List["IceServer"]


@dataclass
class IceServer:
    """ICE server configuration for WebRTC.
    
    This is equivalent to the IceServer interface in TypeScript.
    
    Attributes:
        urls: ICE server URL(s) - can be a single string or list of strings
        username: Optional username for authenticated ICE servers
        credential: Optional credential for authenticated ICE servers
    """
    urls: Union[str, List[str]]
    username: Optional[str] = None
    credential: Optional[str] = None


# Forward reference resolution for SessionConfig
SessionConfig.__annotations__["ice_servers"] = List[IceServer]
