export class OrgaAIError extends Error {
    public readonly status?: number;
    public readonly code?: string;
  
    constructor(message: string, status?: number, code?: string) {
      super(message);
      this.name = 'OrgaAIError';
      this.status = status;
      this.code = code;
    }
  }
  
  export class OrgaAIAuthenticationError extends OrgaAIError {
    constructor(message: string = 'Authentication failed') {
      super(message, 401, 'AUTHENTICATION_ERROR');
    }
  }
  
  export class OrgaAIServerError extends OrgaAIError {
    constructor(message: string = 'Server error', status: number = 500) {
      super(message, status, 'SERVER_ERROR');
    }
  }