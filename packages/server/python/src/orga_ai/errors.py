"""Custom exception classes for OrgaAI Python SDK.

This module defines all the custom exceptions that can be raised by the SDK.
These are equivalent to the custom error classes in the TypeScript version.
"""

from typing import Optional


class OrgaAIError(Exception):
    """Base exception class for all OrgaAI errors.
    
    This is equivalent to the OrgaAIError class in TypeScript.
    
    Attributes:
        message: Error message
        status: Optional HTTP status code
        code: Optional error code
    """
    
    def __init__(
        self, 
        message: str, 
        status: Optional[int] = None, 
        code: Optional[str] = None
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status = status
        self.code = code
        self.name = "OrgaAIError"


class OrgaAIAuthenticationError(OrgaAIError):
    """Raised when authentication fails (401 errors).
    
    This is equivalent to the OrgaAIAuthenticationError class in TypeScript.
    Typically raised when the API key or user email is invalid.
    """
    
    def __init__(self, message: str = "Authentication failed") -> None:
        super().__init__(message, status=401, code="AUTHENTICATION_ERROR")
        self.name = "OrgaAIAuthenticationError"


class OrgaAIServerError(OrgaAIError):
    """Raised when server errors occur (5xx errors).
    
    This is equivalent to the OrgaAIServerError class in TypeScript.
    Typically raised for 500, 502, 503, and other server-side errors.
    """
    
    def __init__(self, message: str = "Server error", status: int = 500) -> None:
        super().__init__(message, status=status, code="SERVER_ERROR")
        self.name = "OrgaAIServerError"
