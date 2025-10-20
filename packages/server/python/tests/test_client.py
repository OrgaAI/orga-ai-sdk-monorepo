"""Tests for the OrgaAI client.

These tests verify that the client correctly handles API communication,
error conditions, and data parsing. They use pytest and pytest-httpx
for mocking HTTP requests.
"""

import pytest
import httpx
from unittest.mock import AsyncMock

from orga_ai import OrgaAI, OrgaAIConfig
from orga_ai.errors import (
    OrgaAIError,
    OrgaAIAuthenticationError,
    OrgaAIServerError,
)


class TestOrgaAIClient:
    """Test cases for the OrgaAI client class."""
    
    @pytest.fixture
    def config(self):
        """Create a test configuration."""
        return OrgaAIConfig(
            api_key="test_api_key",
            user_email="test@example.com"
        )
    
    @pytest.fixture
    def client(self, config):
        """Create a test client instance."""
        return OrgaAI(config)
    
    def test_init_valid_config(self, config):
        """Test that client initializes with valid config."""
        client = OrgaAI(config)
        assert client.api_key == "test_api_key"
        assert client.user_email == "test@example.com"
        assert client.base_url == "https://api.orga-ai.com"
        assert client.debug is False
        assert client.timeout == 10000
    
    def test_init_custom_config(self):
        """Test that client initializes with custom config values."""
        config = OrgaAIConfig(
            api_key="test_key",
            user_email="test@example.com",
            base_url="https://custom.api.com",
            debug=True,
            timeout=30000
        )
        client = OrgaAI(config)
        assert client.base_url == "https://custom.api.com"
        assert client.debug is True
        assert client.timeout == 30000
    
    def test_init_missing_api_key(self):
        """Test that client raises error when API key is missing."""
        config = OrgaAIConfig(
            api_key="",
            user_email="test@example.com"
        )
        with pytest.raises(OrgaAIError, match="API key is required"):
            OrgaAI(config)
    
    def test_init_missing_user_email(self):
        """Test that client raises error when user email is missing."""
        config = OrgaAIConfig(
            api_key="test_key",
            user_email=""
        )
        with pytest.raises(OrgaAIError, match="User email is required"):
            OrgaAI(config)
    
    def test_init_invalid_email_format(self):
        """Test that client raises error for invalid email format."""
        config = OrgaAIConfig(
            api_key="test_key",
            user_email="invalid-email"
        )
        with pytest.raises(OrgaAIError, match="Invalid email format"):
            OrgaAI(config)
    
    @pytest.mark.asyncio
    async def test_get_session_config_success(self, client):
        """Test successful session config retrieval."""
        # Mock the HTTP responses
        ephemeral_response = {
            "ephemeral_token": "test_token_123"
        }
        ice_response = {
            "iceServers": [
                {
                    "urls": "stun:stun1.l.google.com:19302"
                },
                {
                    "urls": ["turn:turn.example.com:3478"],
                    "username": "user",
                    "credential": "pass"
                }
            ]
        }
        
        # Mock the HTTP client
        mock_client = AsyncMock()
        mock_client.post.return_value = AsyncMock(
            status_code=200,
            is_success=True,
            json=AsyncMock(return_value=ephemeral_response)
        )
        mock_client.get.return_value = AsyncMock(
            status_code=200,
            is_success=True,
            json=AsyncMock(return_value=ice_response)
        )
        
        # Replace the client's HTTP client
        client._client = mock_client
        
        # Call the method
        result = await client.get_session_config()
        
        # Verify the result
        assert result.ephemeral_token == "test_token_123"
        assert len(result.ice_servers) == 2
        assert result.ice_servers[0].urls == "stun:stun1.l.google.com:19302"
        assert result.ice_servers[1].urls == ["turn:turn.example.com:3478"]
        assert result.ice_servers[1].username == "user"
        assert result.ice_servers[1].credential == "pass"
    
    @pytest.mark.asyncio
    async def test_fetch_ephemeral_token_authentication_error(self, client):
        """Test authentication error when fetching ephemeral token."""
        # Mock 401 response
        mock_client = AsyncMock()
        mock_client.post.return_value = AsyncMock(
            status_code=401,
            is_success=False,
            reason_phrase="Unauthorized"
        )
        
        client._client = mock_client
        
        with pytest.raises(OrgaAIAuthenticationError, match="Invalid API key or user email"):
            await client._fetch_ephemeral_token()
    
    @pytest.mark.asyncio
    async def test_fetch_ephemeral_token_server_error(self, client):
        """Test server error when fetching ephemeral token."""
        # Mock 500 response
        mock_client = AsyncMock()
        mock_client.post.return_value = AsyncMock(
            status_code=500,
            is_success=False,
            reason_phrase="Internal Server Error"
        )
        
        client._client = mock_client
        
        with pytest.raises(OrgaAIServerError, match="Failed to fetch ephemeral token"):
            await client._fetch_ephemeral_token()
    
    @pytest.mark.asyncio
    async def test_fetch_ice_servers_server_error(self, client):
        """Test server error when fetching ICE servers."""
        # Mock 500 response
        mock_client = AsyncMock()
        mock_client.get.return_value = AsyncMock(
            status_code=500,
            is_success=False,
            reason_phrase="Internal Server Error"
        )
        
        client._client = mock_client
        
        with pytest.raises(OrgaAIServerError, match="Failed to fetch ICE servers"):
            await client._fetch_ice_servers("test_token")
    
    @pytest.mark.asyncio
    async def test_log_debug_message(self, config):
        """Test that debug messages are logged when debug is enabled."""
        config.debug = True
        client = OrgaAI(config)
        
        # Capture print output
        import io
        import sys
        
        captured_output = io.StringIO()
        sys.stdout = captured_output
        
        try:
            client._log("Test message", {"key": "value"})
            output = captured_output.getvalue()
            assert "[OrgaAI] Test message" in output
            assert "{'key': 'value'}" in output
        finally:
            sys.stdout = sys.__stdout__
    
    @pytest.mark.asyncio
    async def test_log_no_debug_message(self, client):
        """Test that debug messages are not logged when debug is disabled."""
        import io
        import sys
        
        captured_output = io.StringIO()
        sys.stdout = captured_output
        
        try:
            client._log("Test message")
            output = captured_output.getvalue()
            assert output == ""
        finally:
            sys.stdout = sys.__stdout__
