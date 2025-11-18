import {
  OrgaAIError,
  ConfigurationError,
  ConnectionError,
  PermissionError,
  SessionError,
} from '../../errors';

describe('Error Classes', () => {
  describe('OrgaAIError', () => {
    it('should create error with message and code', () => {
      const error = new OrgaAIError('Test error', 'TEST_ERROR');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('OrgaAIError');
    });
  });

  describe('ConfigurationError', () => {
    it('should create error with default message', () => {
      const error = new ConfigurationError();
      
      expect(error).toBeInstanceOf(OrgaAIError);
      expect(error.message).toBe('Invalid configuration');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.name).toBe('ConfigurationError');
    });

    it('should create error with custom message', () => {
      const error = new ConfigurationError('Custom config error');
      
      expect(error.message).toBe('Custom config error');
      expect(error.code).toBe('CONFIGURATION_ERROR');
    });
  });

  describe('ConnectionError', () => {
    it('should create error with default message', () => {
      const error = new ConnectionError();
      
      expect(error).toBeInstanceOf(OrgaAIError);
      expect(error.message).toBe('Failed to connect to Orga AI service');
      expect(error.code).toBe('CONNECTION_ERROR');
      expect(error.name).toBe('ConnectionError');
    });

    it('should create error with custom message', () => {
      const error = new ConnectionError('Network timeout');
      
      expect(error.message).toBe('Network timeout');
      expect(error.code).toBe('CONNECTION_ERROR');
    });
  });

  describe('PermissionError', () => {
    it('should create error with default message', () => {
      const error = new PermissionError();
      
      expect(error).toBeInstanceOf(OrgaAIError);
      expect(error.message).toBe('Media permissions denied');
      expect(error.code).toBe('PERMISSION_DENIED');
      expect(error.name).toBe('PermissionError');
    });

    it('should create error with custom message', () => {
      const error = new PermissionError('Camera access denied');
      
      expect(error.message).toBe('Camera access denied');
      expect(error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('SessionError', () => {
    it('should create error with default message', () => {
      const error = new SessionError();
      
      expect(error).toBeInstanceOf(OrgaAIError);
      expect(error.message).toBe('Session error occurred');
      expect(error.code).toBe('SESSION_ERROR');
      expect(error.name).toBe('SessionError');
    });

    it('should create error with custom message', () => {
      const error = new SessionError('Session expired');
      
      expect(error.message).toBe('Session expired');
      expect(error.code).toBe('SESSION_ERROR');
    });
  });
});

