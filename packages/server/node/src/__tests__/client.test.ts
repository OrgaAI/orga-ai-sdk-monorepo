import { OrgaAI } from '../client';
import { OrgaAIError, OrgaAIAuthenticationError, OrgaAIServerError } from '../errors';

describe('OrgaAI Client', () => {
  const validConfig = {
    apiKey: 'test-api-key',
    userEmail: 'test@example.com'
  };

  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global as any, 'fetch');
    fetchSpy.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with valid config', () => {
      const client = new OrgaAI(validConfig);
      expect(client).toBeInstanceOf(OrgaAI);
    });

    it('should throw error when apiKey is missing', () => {
      expect(() => {
        new OrgaAI({ userEmail: 'test@example.com' } as any);
      }).toThrow(OrgaAIError);
      expect(() => {
        new OrgaAI({ userEmail: 'test@example.com' } as any);
      }).toThrow('API key is required');
    });

    it('should throw error when userEmail is missing', () => {
      expect(() => {
        new OrgaAI({ apiKey: 'test-key' } as any);
      }).toThrow(OrgaAIError);
      expect(() => {
        new OrgaAI({ apiKey: 'test-key' } as any);
      }).toThrow('User email is required');
    });
  });

  describe('getSessionConfig', () => {
    it('should return session config successfully', async () => {
      const mockEphemeralToken = 'test-ephemeral-token';
      const mockIceServers = [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ];

      fetchSpy
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ephemeral_token: mockEphemeralToken }) } as any)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ iceServers: mockIceServers }) } as any);

      const client = new OrgaAI(validConfig);
      const result = await client.getSessionConfig();

      expect(result).toEqual({
        ephemeralToken: mockEphemeralToken,
        iceServers: mockIceServers
      });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle authentication error', async () => {
      fetchSpy.mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized', json: async () => ({}) } as any);

      const client = new OrgaAI(validConfig);
      const prom = client.getSessionConfig();
      await expect(prom).rejects.toThrow(OrgaAIAuthenticationError);
      await expect(prom).rejects.toThrow('Invalid API key or user email');
    });

    it('should handle server error on ephemeral token fetch', async () => {
      fetchSpy.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'ISE', json: async () => ({}) } as any);

      const client = new OrgaAI(validConfig);
      const prom = client.getSessionConfig();
      await expect(prom).rejects.toThrow(OrgaAIServerError);
      await expect(prom).rejects.toThrow('Failed to fetch ephemeral token');
    });

    it('should handle server error on ICE servers fetch', async () => {
      fetchSpy
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ephemeral_token: 'ephem' }) } as any)
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'ISE', json: async () => ({}) } as any);

      const client = new OrgaAI(validConfig);
      const prom = client.getSessionConfig();
      await expect(prom).rejects.toThrow(OrgaAIServerError);
      await expect(prom).rejects.toThrow('Failed to fetch ICE servers');
    });

    it('should handle network errors', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      const client = new OrgaAI(validConfig);
      await expect(client.getSessionConfig()).rejects.toThrow('Failed to get session config');
    });
  });
  describe('Timeout handling', () => {
    it('should handle timeout error', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Timeout error'));
      const client = new OrgaAI(validConfig);
      await expect(client.getSessionConfig()).rejects.toThrow('Failed to get session config: Timeout error');
    });
  
    it('should use custom timeout duration', async () => {
      const customTimeout = 1000;
      const client = new OrgaAI({
        ...validConfig,
        timeout: customTimeout
      });
      
      fetchSpy.mockRejectedValueOnce(new Error('The operation was aborted'));
      
      await expect(client.getSessionConfig()).rejects.toThrow('Failed to get session config: The operation was aborted');
    });
    it('should handle AbortError specifically', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      fetchSpy.mockRejectedValueOnce(abortError);
      
      const client = new OrgaAI(validConfig);
      await expect(client.getSessionConfig()).rejects.toThrow('Failed to get session config: The operation was aborted');
    });
  
    it('should handle timeout on ephemeral token fetch', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Request timeout'));
      
      const client = new OrgaAI(validConfig);
      await expect(client.getSessionConfig()).rejects.toThrow('Failed to get session config: Request timeout');
    });
  
    it('should handle timeout on ICE servers fetch', async () => {
      fetchSpy
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ephemeral_token: 'token' }) } as any)
        .mockRejectedValueOnce(new Error('Request timeout'));
      
      const client = new OrgaAI(validConfig);
      await expect(client.getSessionConfig()).rejects.toThrow('Failed to get session config: Request timeout');
    });
  });
});