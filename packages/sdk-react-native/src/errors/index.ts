// src/errors/index.ts
export class OrgaAIError extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = 'OrgaAIError';
    }
  }
  
  export class PermissionError extends OrgaAIError {
    constructor(message: string = 'Media permissions denied') {
      super(message, 'PERMISSION_DENIED');
      this.name = 'PermissionError';
    }
  }
  
  export class ConnectionError extends OrgaAIError {
    constructor(message: string = 'Failed to connect to Orga AI service') {
      super(message, 'CONNECTION_ERROR');
      this.name = 'ConnectionError';
    }
  }
  
  export class SessionError extends OrgaAIError {
    constructor(message: string = 'Session error occurred') {
      super(message, 'SESSION_ERROR');
      this.name = 'SessionError';
    }
  }
  
  export class ConfigurationError extends OrgaAIError {
    constructor(message: string = 'Invalid configuration') {
      super(message, 'CONFIGURATION_ERROR');
      this.name = 'ConfigurationError';
    }
  }