import nock from 'nock';
import { OrgaAI } from '../client';

describe('OrgaAI Integration Tests', () => {
  const validConfig = {
    apiKey: 'test-api-key'
  };

  beforeEach(() => {
    // Clean up before each test
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should work with real API structure', async () => {
    const mockEphemeralToken = 'ephemeral-token-123';
    const mockIceServers = [
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ];

    nock('https://api.orga-ai.com')
      .post('/v1/realtime/client-secrets')
      .reply(200, { ephemeral_token: mockEphemeralToken });

    nock('https://api.orga-ai.com')
      .get('/v1/realtime/ice-config')
      .reply(200, { iceServers: mockIceServers });

    const client = new OrgaAI(validConfig);
    const result = await client.getSessionConfig();

    expect(result).toEqual({
      ephemeralToken: mockEphemeralToken,
      iceServers: mockIceServers
    });
  });

  it('should handle 401 authentication error', async () => {
    nock('https://api.orga-ai.com')
      .post('/v1/realtime/client-secrets')
      .reply(401, { error: 'Unauthorized' });

    const client = new OrgaAI(validConfig);

    await expect(client.getSessionConfig()).rejects.toThrow('Invalid API key');
  });

  it('should handle 500 server error', async () => {
    nock('https://api.orga-ai.com')
      .post('/v1/realtime/client-secrets')
      .reply(500, { error: 'Internal Server Error' });

    const client = new OrgaAI(validConfig);

    await expect(client.getSessionConfig()).rejects.toThrow('Failed to fetch ephemeral token');
  });

  it('should handle custom baseUrl', async () => {
    const customBaseUrl = 'https://custom-api.orga-ai.com';
    const mockEphemeralToken = 'ephemeral-token-123';
    const mockIceServers = [{ urls: 'stun:stun1.l.google.com:19302' }];

    nock(customBaseUrl)
      .post('/v1/realtime/client-secrets')
      .reply(200, { ephemeral_token: mockEphemeralToken });

    nock(customBaseUrl)
      .get('/v1/realtime/ice-config')
      .reply(200, { iceServers: mockIceServers });

    const client = new OrgaAI({
      ...validConfig,
      baseUrl: customBaseUrl
    });

    const result = await client.getSessionConfig();

    expect(result).toEqual({
      ephemeralToken: mockEphemeralToken,
      iceServers: mockIceServers
    });
  });
});