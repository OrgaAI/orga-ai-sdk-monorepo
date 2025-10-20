"""Tests for OrgaAI error classes.

These tests verify that custom exceptions are properly defined
and behave as expected.
"""

import pytest

from orga_ai.errors import (
    OrgaAIError,
    OrgaAIAuthenticationError,
    OrgaAIServerError,
)


class TestOrgaAIErrors:
    """Test cases for OrgaAI error classes."""
    
    def test_orga_ai_error_basic(self):
        """Test basic OrgaAI error creation."""
        error = OrgaAIError("Test message")
        
        assert str(error) == "Test message"
        assert error.message == "Test message"
        assert error.status is None
        assert error.code is None
        assert error.name == "OrgaAIError"
    
    def test_orga_ai_error_with_status_and_code(self):
        """Test OrgaAI error with status and code."""
        error = OrgaAIError("Test message", status=400, code="BAD_REQUEST")
        
        assert str(error) == "Test message"
        assert error.message == "Test message"
        assert error.status == 400
        assert error.code == "BAD_REQUEST"
        assert error.name == "OrgaAIError"
    
    def test_authentication_error_default(self):
        """Test authentication error with default message."""
        error = OrgaAIAuthenticationError()
        
        assert str(error) == "Authentication failed"
        assert error.message == "Authentication failed"
        assert error.status == 401
        assert error.code == "AUTHENTICATION_ERROR"
        assert error.name == "OrgaAIAuthenticationError"
    
    def test_authentication_error_custom_message(self):
        """Test authentication error with custom message."""
        error = OrgaAIAuthenticationError("Custom auth error")
        
        assert str(error) == "Custom auth error"
        assert error.message == "Custom auth error"
        assert error.status == 401
        assert error.code == "AUTHENTICATION_ERROR"
        assert error.name == "OrgaAIAuthenticationError"
    
    def test_server_error_default(self):
        """Test server error with default values."""
        error = OrgaAIServerError()
        
        assert str(error) == "Server error"
        assert error.message == "Server error"
        assert error.status == 500
        assert error.code == "SERVER_ERROR"
        assert error.name == "OrgaAIServerError"
    
    def test_server_error_custom_values(self):
        """Test server error with custom values."""
        error = OrgaAIServerError("Custom server error", status=502)
        
        assert str(error) == "Custom server error"
        assert error.message == "Custom server error"
        assert error.status == 502
        assert error.code == "SERVER_ERROR"
        assert error.name == "OrgaAIServerError"
    
    def test_error_inheritance(self):
        """Test that custom errors inherit from OrgaAIError."""
        auth_error = OrgaAIAuthenticationError()
        server_error = OrgaAIServerError()
        
        assert isinstance(auth_error, OrgaAIError)
        assert isinstance(server_error, OrgaAIError)
        assert isinstance(auth_error, Exception)
        assert isinstance(server_error, Exception)
