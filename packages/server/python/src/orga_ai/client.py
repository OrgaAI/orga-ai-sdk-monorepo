"""Main OrgaAI client class for Python SDK.

This module contains the core OrgaAI client that handles API communication
and session configuration. This is equivalent to the client.ts file in the TypeScript version.
"""

import re
import asyncio
import warnings
from typing import Dict, Any, Optional
from urllib.parse import urlencode

import httpx

from .types import OrgaAIConfig, SessionConfig, IceServer
from .errors import (
    OrgaAIError,
    OrgaAIAuthenticationError,
    OrgaAIServerError,
)


class OrgaAI:
    """Main OrgaAI client class.
    
    This is equivalent to the OrgaAI class in the TypeScript version.
    Provides a simple interface for fetching session configuration.
    """
    
    def __init__(self, config: OrgaAIConfig) -> None:
        """Initialize the OrgaAI client.
        
        Args:
            config: Configuration object containing API key, user email, and optional settings
            
        Raises:
            OrgaAIError: If required configuration is missing or invalid
        """
        # Validate required fields (equivalent to TypeScript validation)
        if not config.api_key:
            raise OrgaAIError("API key is required")
        if not config.user_email:
            raise OrgaAIError("User email is required")
        
        # Validate email format (same regex as TypeScript version)
        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_regex, config.user_email):
            raise OrgaAIError("Invalid email format")
        
        # Set configuration with defaults (equivalent to TypeScript defaults)
        self.api_key = config.api_key
        self.user_email = config.user_email
        self.base_url = config.base_url or "https://api.orga-ai.com"
        self.debug = config.debug or False
        self.timeout = config.timeout or 10000
        
        # Create HTTP client (equivalent to fetch in TypeScript)
        self._client = httpx.AsyncClient(timeout=self.timeout / 1000)  # Convert ms to seconds
    
    def _log(self, message: str, data: Optional[Any] = None) -> None:
        """Log debug messages if debug mode is enabled.
        
        This is equivalent to the private log method in the TypeScript version.
        """
        if self.debug:
            if data is not None:
                print(f"[OrgaAI] {message}", data)
            else:
                print(f"[OrgaAI] {message}")
    
    async def get_session_config(self) -> SessionConfig:
        """Get session configuration for the user.
        
        This is equivalent to the getSessionConfig() method in the TypeScript version.
        
        Returns:
            SessionConfig: Contains ephemeral token and ICE servers
            
        Raises:
            OrgaAIError: For various error conditions
            OrgaAIAuthenticationError: For authentication failures
            OrgaAIServerError: For server errors
        """
        try:
            self._log("Fetching session config")
            
            # Fetch ephemeral token first
            ephemeral_token = await self._fetch_ephemeral_token()
            self._log("Fetched ephemeral token", ephemeral_token)
            
            # Then fetch ICE servers using the token
            ice_servers = await self._fetch_ice_servers(ephemeral_token)
            self._log("Fetched ICE servers", ice_servers)
            
            return SessionConfig(
                ephemeral_token=ephemeral_token,
                ice_servers=ice_servers
            )
            
        except (OrgaAIError, OrgaAIAuthenticationError, OrgaAIServerError):
            # Re-raise our custom errors
            raise
        except Exception as error:
            # Wrap unexpected errors
            raise OrgaAIServerError(
                f"Failed to get session config: {str(error)}"
            )
    
    async def _fetch_ephemeral_token(self) -> str:
        """Fetch ephemeral token from the API.
        
        This is equivalent to the fetchEphemeralToken() method in the TypeScript version.
        
        Returns:
            str: The ephemeral token
            
        Raises:
            OrgaAIAuthenticationError: If authentication fails (401)
            OrgaAIServerError: For other HTTP errors
        """
        # Build URL with email parameter (equivalent to TypeScript URL construction)
        params = {"email": self.user_email}
        url = f"{self.base_url}/v1/realtime/client-secrets?{urlencode(params)}"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        try:
            response = await self._client.post(url, headers=headers)
            
            if response.status_code == 401:
                raise OrgaAIAuthenticationError("Invalid API key or user email")
            elif not response.is_success:
                raise OrgaAIServerError(
                    f"Failed to fetch ephemeral token: {response.reason_phrase}",
                    response.status_code
                )
            
            try:
                data = response.json()
                return data["ephemeral_token"]
            except (KeyError, ValueError, TypeError) as error:
                raise OrgaAIServerError(f"Invalid response format: {str(error)}")
            
        except httpx.RequestError as error:
            raise OrgaAIServerError(f"Network error: {str(error)}")
    
    async def _fetch_ice_servers(self, ephemeral_token: str) -> list[IceServer]:
        """Fetch ICE servers from the API.
        
        This is equivalent to the fetchIceServers() method in the TypeScript version.
        
        Args:
            ephemeral_token: The ephemeral token obtained from _fetch_ephemeral_token
            
        Returns:
            list[IceServer]: List of ICE server configurations
            
        Raises:
            OrgaAIServerError: For HTTP errors
        """
        url = f"{self.base_url}/v1/realtime/ice-config"
        headers = {"Authorization": f"Bearer {ephemeral_token}"}
        
        try:
            response = await self._client.get(url, headers=headers)
            
            if not response.is_success:
                raise OrgaAIServerError(
                    f"Failed to fetch ICE servers: {response.reason_phrase}",
                    response.status_code
                )
            
            try:
                data = response.json()
                ice_servers_data = data["iceServers"]
            except (KeyError, ValueError, TypeError) as error:
                raise OrgaAIServerError(f"Invalid response format: {str(error)}")
            
            # Convert dict data to IceServer objects
            ice_servers = []
            for server_data in ice_servers_data:
                ice_server = IceServer(
                    urls=server_data["urls"],
                    username=server_data.get("username"),
                    credential=server_data.get("credential")
                )
                ice_servers.append(ice_server)
            
            return ice_servers
            
        except httpx.RequestError as error:
            raise OrgaAIServerError(f"Network error: {str(error)}")
    
    async def close(self) -> None:
        """Close the HTTP client and clean up resources.
        
        This should be called when you're done with the client to avoid
        resource leaks. In async contexts, it's good practice to use this.
        """
        await self._client.aclose()
    
    def __enter__(self) -> "OrgaAI":
        """Support for context manager (with statement)."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        """Clean up when exiting sync context manager."""
        try:
            # Try to close in current thread
            loop = asyncio.get_event_loop()
            if not loop.is_running():
                loop.run_until_complete(self.close())
            else:
                # If we're in an async context, schedule cleanup
                warnings.warn(
                    "OrgaAI client used in sync context manager within async context. "
                    "Use 'async with' instead for proper cleanup.",
                    ResourceWarning
                )
        except RuntimeError:
            # No event loop, create one for cleanup
            asyncio.run(self.close())
    
    async def __aenter__(self) -> "OrgaAI":
        """Support for async context manager (async with statement)."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Clean up when exiting async context manager."""
        await self.close()


# Convenience function for synchronous usage
def get_session_config_sync(config: OrgaAIConfig) -> SessionConfig:
    """Synchronous wrapper for get_session_config.
    
    This allows users to use the SDK without async/await if they prefer.
    
    Args:
        config: Configuration object
        
    Returns:
        SessionConfig: Session configuration
        
    Raises:
        OrgaAIError: For various error conditions
    """
    async def _async_wrapper():
        async with OrgaAI(config) as client:
            return await client.get_session_config()
    
    def _run_in_new_loop(coro):
        """Run coroutine in a new event loop in a separate thread."""
        return asyncio.run(coro)
    
    # Run the async function in a new event loop
    try:
        loop = asyncio.get_running_loop()
        # We're in an async context, run in a separate thread
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(_run_in_new_loop, _async_wrapper())
            return future.result()
    except RuntimeError:
        # No event loop running, safe to create one
        return asyncio.run(_async_wrapper())
