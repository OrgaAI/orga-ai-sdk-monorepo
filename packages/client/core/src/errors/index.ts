/**
 * Base error class for all Orga AI SDK errors
 */
export class OrgaAIError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'OrgaAIError';
  }
}

/**
 * Error thrown when media permissions are denied
 */
export class PermissionError extends OrgaAIError {
  constructor(message: string = 'Media permissions denied') {
    super(message, 'PERMISSION_DENIED');
    this.name = 'PermissionError';
  }
}

/**
 * Error thrown when connection to Orga AI service fails
 */
export class ConnectionError extends OrgaAIError {
  constructor(message: string = 'Failed to connect to Orga AI service') {
    super(message, 'CONNECTION_ERROR');
    this.name = 'ConnectionError';
  }
}

/**
 * Error thrown when a session error occurs
 */
export class SessionError extends OrgaAIError {
  constructor(message: string = 'Session error occurred') {
    super(message, 'SESSION_ERROR');
    this.name = 'SessionError';
  }
}

/**
 * Error thrown when SDK configuration is invalid
 */
export class ConfigurationError extends OrgaAIError {
  constructor(message: string = 'Invalid configuration') {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}

