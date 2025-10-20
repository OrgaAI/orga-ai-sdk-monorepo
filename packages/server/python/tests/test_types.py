"""Tests for OrgaAI type definitions.

These tests verify that dataclasses are properly defined and behave as expected.
"""

import pytest

from orga_ai.types import OrgaAIConfig, SessionConfig, IceServer


class TestOrgaAITypes:
    """Test cases for OrgaAI type definitions."""
    
    def test_orga_ai_config_basic(self):
        """Test basic OrgaAI config creation."""
        config = OrgaAIConfig(
            api_key="test_key",
            user_email="test@example.com"
        )
        
        assert config.api_key == "test_key"
        assert config.user_email == "test@example.com"
        assert config.base_url is None
        assert config.debug is None
        assert config.timeout is None
    
    def test_orga_ai_config_with_all_fields(self):
        """Test OrgaAI config with all fields."""
        config = OrgaAIConfig(
            api_key="test_key",
            user_email="test@example.com",
            base_url="https://custom.api.com",
            debug=True,
            timeout=30000
        )
        
        assert config.api_key == "test_key"
        assert config.user_email == "test@example.com"
        assert config.base_url == "https://custom.api.com"
        assert config.debug is True
        assert config.timeout == 30000
    
    def test_ice_server_single_url(self):
        """Test ICE server with single URL string."""
        server = IceServer(urls="stun:stun1.l.google.com:19302")
        
        assert server.urls == "stun:stun1.l.google.com:19302"
        assert server.username is None
        assert server.credential is None
    
    def test_ice_server_multiple_urls(self):
        """Test ICE server with multiple URLs."""
        urls = ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
        server = IceServer(urls=urls)
        
        assert server.urls == urls
        assert server.username is None
        assert server.credential is None
    
    def test_ice_server_with_credentials(self):
        """Test ICE server with username and credential."""
        server = IceServer(
            urls="turn:turn.example.com:3478",
            username="user",
            credential="pass"
        )
        
        assert server.urls == "turn:turn.example.com:3478"
        assert server.username == "user"
        assert server.credential == "pass"
    
    def test_session_config(self):
        """Test session configuration."""
        ice_servers = [
            IceServer(urls="stun:stun1.l.google.com:19302"),
            IceServer(
                urls="turn:turn.example.com:3478",
                username="user",
                credential="pass"
            )
        ]
        
        config = SessionConfig(
            ephemeral_token="test_token_123",
            ice_servers=ice_servers
        )
        
        assert config.ephemeral_token == "test_token_123"
        assert config.ice_servers == ice_servers
        assert len(config.ice_servers) == 2
    
    def test_dataclass_equality(self):
        """Test that dataclasses support equality comparison."""
        config1 = OrgaAIConfig(
            api_key="test_key",
            user_email="test@example.com"
        )
        config2 = OrgaAIConfig(
            api_key="test_key",
            user_email="test@example.com"
        )
        
        assert config1 == config2
    
    def test_dataclass_inequality(self):
        """Test that dataclasses support inequality comparison."""
        config1 = OrgaAIConfig(
            api_key="test_key",
            user_email="test@example.com"
        )
        config2 = OrgaAIConfig(
            api_key="different_key",
            user_email="test@example.com"
        )
        
        assert config1 != config2
