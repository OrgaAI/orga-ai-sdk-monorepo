import { OrgaAIConfig, SessionConfig, IceServer } from '../types';

describe('Type Definitions', () => {
  it('should accept valid OrgaAIConfig', () => {
    const config: OrgaAIConfig = {
      apiKey: 'test-key'
    };
    expect(config).toBeDefined();
  });

  it('should accept OrgaAIConfig with optional baseUrl', () => {
    const config: OrgaAIConfig = {
      apiKey: 'test-key',
      baseUrl: 'https://custom-api.orga-ai.com'
    };
    expect(config).toBeDefined();
  });

  it('should create valid SessionConfig', () => {
    const sessionConfig: SessionConfig = {
      ephemeralToken: 'test-token',
      iceServers: [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302', username: 'user', credential: 'pass' }
      ]
    };
    expect(sessionConfig).toBeDefined();
  });

  it('should create valid IceServer', () => {
    const iceServer: IceServer = {
      urls: 'stun:stun1.l.google.com:19302'
    };
    expect(iceServer).toBeDefined();
  });

  it('should create valid IceServer with credentials', () => {
    const iceServer: IceServer = {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      username: 'user',
      credential: 'pass'
    };
    expect(iceServer).toBeDefined();
  });
});