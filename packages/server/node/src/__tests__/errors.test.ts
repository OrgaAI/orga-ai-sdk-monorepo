import { 
    OrgaAIError, 
    OrgaAIAuthenticationError, 
    OrgaAIServerError 
  } from '../errors';
  
  describe('OrgaAI Errors', () => {
    describe('OrgaAIError', () => {
      it('should create error with message', () => {
        const error = new OrgaAIError('Test error');
        expect(error.message).toBe('Test error');
        expect(error.name).toBe('OrgaAIError');
        expect(error.status).toBeUndefined();
        expect(error.code).toBeUndefined();
      });
  
      it('should create error with status and code', () => {
        const error = new OrgaAIError('Test error', 400, 'BAD_REQUEST');
        expect(error.message).toBe('Test error');
        expect(error.status).toBe(400);
        expect(error.code).toBe('BAD_REQUEST');
      });
    });
  
    describe('OrgaAIAuthenticationError', () => {
      it('should create authentication error with default message', () => {
        const error = new OrgaAIAuthenticationError();
        expect(error.message).toBe('Authentication failed');
        expect(error.status).toBe(401);
        expect(error.code).toBe('AUTHENTICATION_ERROR');
      });
  
      it('should create authentication error with custom message', () => {
        const error = new OrgaAIAuthenticationError('Custom auth error');
        expect(error.message).toBe('Custom auth error');
        expect(error.status).toBe(401);
        expect(error.code).toBe('AUTHENTICATION_ERROR');
      });
    });
  
    describe('OrgaAIServerError', () => {
      it('should create server error with default values', () => {
        const error = new OrgaAIServerError();
        expect(error.message).toBe('Server error');
        expect(error.status).toBe(500);
        expect(error.code).toBe('SERVER_ERROR');
      });
  
      it('should create server error with custom values', () => {
        const error = new OrgaAIServerError('Custom server error', 503);
        expect(error.message).toBe('Custom server error');
        expect(error.status).toBe(503);
        expect(error.code).toBe('SERVER_ERROR');
      });
    });
  });