import {
  getMediaConstraints,
  fetchEphemeralTokenAndIceServers,
  connectToRealtime,
  logger,
  MIN_MAX_IDEAL_VIDEO_CONSTRAINTS
} from '../utils';
import axios from 'axios';
import * as OrgaAIModule from '../core/OrgaAI';

jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('utils', () => {
  describe('getMediaConstraints', () => {
    it('returns correct constraints for each videoQuality', () => {
      (['low', 'medium', 'high'] as const).forEach((quality) => {
        const constraints = getMediaConstraints({ videoQuality: quality });
        expect(constraints.video).toMatchObject({
          ...MIN_MAX_IDEAL_VIDEO_CONSTRAINTS[quality],
          facingMode: 'user',
        });
      });
    });

    it('returns correct facingMode', () => {
      const constraints = getMediaConstraints({ facingMode: 'environment' });
      if (constraints.video && typeof constraints.video === 'object') {
        expect(constraints.video.facingMode).toBe('environment');
      } else {
        throw new Error('video constraints should be an object');
      }
    });

    it('defaults to medium quality and user facingMode', () => {
      const constraints = getMediaConstraints();
      expect(constraints.video).toMatchObject({
        ...MIN_MAX_IDEAL_VIDEO_CONSTRAINTS['medium'],
        facingMode: 'user',
      });
    });
  });

  describe('fetchEphemeralTokenAndIceServers', () => {
    const endpoint = 'https://test.com/ephemeral';
    afterEach(() => jest.clearAllMocks());

    it('returns ephemeralToken and iceServers on valid response', async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: {
          ephemeralToken: 'token123',
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        },
      });
      const result = await fetchEphemeralTokenAndIceServers(endpoint);
      expect(result).toEqual({
        ephemeralToken: 'token123',
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      expect(mockAxios.get).toHaveBeenCalledWith(endpoint);
    });

    it('throws if response is missing ephemeralToken', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: { iceServers: [] } });
      await expect(fetchEphemeralTokenAndIceServers(endpoint)).rejects.toThrow('Invalid response from ephemeral token endpoint');
    });

    it('throws if response is missing iceServers', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: { ephemeralToken: 'token123' } });
      await expect(fetchEphemeralTokenAndIceServers(endpoint)).rejects.toThrow('Invalid response from ephemeral token endpoint');
    });
  });

  describe('connectToRealtime', () => {
    const mockEphemeralToken = 'token123';
    const mockPeerConnection = {
      localDescription: { sdp: 'sdp', type: 'offer' },
    } as any;
    const mockGathered = [{ candidate: 'candidate1' }];
    const mockConfig = {
      voice: 'Dora',
      model: 'Orga (1) beta',
      temperature: 0.5,
      maxTokens: 50,
    };
    const mockAnswer = { sdp: 'answer-sdp', type: 'answer' };
    const mockConversationId = 'conv-123';

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(OrgaAIModule.OrgaAI, 'getConfig').mockReturnValue(mockConfig);
    });

    it('returns conversation_id and answer on valid response', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { answer: mockAnswer, conversation_id: mockConversationId },
      });
      // Patch OrgaAI.getConfig
      const OrgaAI = require('../core/OrgaAI').OrgaAI;
      jest.spyOn(OrgaAI, 'getConfig').mockReturnValue(mockConfig);
      const result = await connectToRealtime({
        ephemeralToken: mockEphemeralToken,
        peerConnection: mockPeerConnection,
        gathered: mockGathered,
      });
      expect(result).toEqual({ conversation_id: mockConversationId, answer: mockAnswer });
      expect(mockAxios.post).toHaveBeenCalled();
    });

    it('throws if response is missing answer', async () => {
      mockAxios.post.mockResolvedValueOnce({ data: { conversation_id: mockConversationId } });
      const OrgaAI = require('../core/OrgaAI').OrgaAI;
      jest.spyOn(OrgaAI, 'getConfig').mockReturnValue(mockConfig);
      await expect(
        connectToRealtime({
          ephemeralToken: mockEphemeralToken,
          peerConnection: mockPeerConnection,
          gathered: mockGathered,
        })
      ).rejects.toThrow('No answer in response');
    });
  });

  describe('logger', () => {
    let originalConsole: any;
    beforeEach(() => {
      originalConsole = { ...console };
      console.log = jest.fn();
      console.info = jest.fn();
      console.warn = jest.fn();
      console.error = jest.fn();
      // @ts-ignore
      global.OrgaAI = { config: { logLevel: 'debug' } };
    });
    afterEach(() => {
      Object.assign(console, originalConsole);
      // @ts-ignore
      global.OrgaAI = undefined;
    });

    it('logger.debug logs only at debug level', () => {
      logger.debug('debug message');
      expect(console.log).toHaveBeenCalledWith('[OrgaAI Debug] debug message');
    });

    it('logger.info logs at info and debug levels', () => {
      (global.OrgaAI!.config.logLevel = 'info');
      logger.info('info message');
      expect(console.info).toHaveBeenCalledWith('[OrgaAI Info] info message');
      (global.OrgaAI!.config.logLevel = 'debug');
      logger.info('info message');
      expect(console.info).toHaveBeenCalledWith('[OrgaAI Info] info message');
    });

    it('logger.warn logs at warn, info, and debug levels', () => {
      (['warn', 'info', 'debug'] as Array<'warn' | 'info' | 'debug'>).forEach((level) => {
        (global.OrgaAI!.config.logLevel = level);
        logger.warn('warn message');
        expect(console.warn).toHaveBeenCalledWith('[OrgaAI Warn] warn message');
      });
    });

    it('logger.error logs unless logLevel is none', () => {
      (global.OrgaAI!.config.logLevel = 'warn');
      logger.error('error message');
      expect(console.error).toHaveBeenCalledWith('[OrgaAI Error] error message');
      (console.error as jest.Mock).mockClear();
      (global.OrgaAI!.config.logLevel = 'none');
      logger.error('error message');
      expect(console.error).not.toHaveBeenCalled();
    });
  });
}); 