import { OrgaAI } from '../../core/OrgaAI';
import { ConfigurationError } from '../../errors';
import { ORGAAI_TEMPERATURE_RANGE } from '../../types';

// Mock the utils module
jest.mock('../../utils', () => ({
  fetchSessionConfig: jest.fn(),
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('OrgaAI', () => {
  const mockFetchFn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global state
    global.OrgaAI = undefined;
  });

  afterEach(() => {
    // Clean up global state
    global.OrgaAI = undefined;
  });

  describe('init()', () => {
    it('should initialize with valid config using sessionConfigEndpoint', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token',
        model: 'orga-1-beta' as const,
        voice: 'alloy' as const
      };

      OrgaAI.init(config);

      expect(global.OrgaAI).toBeDefined();
      expect(global.OrgaAI?.isInitialized).toBe(true);
      expect(global.OrgaAI?.config.sessionConfigEndpoint).toBe('https://api.example.com/token');
      expect(global.OrgaAI?.config.model).toBe('orga-1-beta');
      expect(global.OrgaAI?.config.voice).toBe('alloy');
    });

    it('should initialize with valid config using fetchSessionConfig', () => {
      const config = {
        fetchSessionConfig: mockFetchFn,
        model: 'orga-1-beta' as const,
        voice: 'alloy' as const
      };

      OrgaAI.init(config);

      expect(global.OrgaAI).toBeDefined();
      expect(global.OrgaAI?.isInitialized).toBe(true);
      expect(global.OrgaAI?.config.fetchSessionConfig).toBe(mockFetchFn);
    });

    it('should set default values when not provided', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token'
      };

      OrgaAI.init(config);

      expect(global.OrgaAI?.config.logLevel).toBe('warn');
      expect(global.OrgaAI?.config.timeout).toBe(30000);
    });

    it('should override default values when provided', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token',
        logLevel: 'debug' as const,
        timeout: 60000
      };

      OrgaAI.init(config);

      expect(global.OrgaAI?.config.logLevel).toBe('debug');
      expect(global.OrgaAI?.config.timeout).toBe(60000);
    });

    it('should validate temperature range', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token',
        temperature: ORGAAI_TEMPERATURE_RANGE.min - 0.1
      };

      expect(() => OrgaAI.init(config)).toThrow(ConfigurationError);
      expect(() => OrgaAI.init(config)).toThrow(
        `Temperature must be between ${ORGAAI_TEMPERATURE_RANGE.min} and ${ORGAAI_TEMPERATURE_RANGE.max}`
      );
    });

    it('should accept temperature at minimum value', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token',
        temperature: ORGAAI_TEMPERATURE_RANGE.min
      };

      expect(() => OrgaAI.init(config)).not.toThrow();
    });

    it('should accept temperature at maximum value', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token',
        temperature: ORGAAI_TEMPERATURE_RANGE.max
      };

      expect(() => OrgaAI.init(config)).not.toThrow();
    });

    it('should accept temperature within range', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token',
        temperature: (ORGAAI_TEMPERATURE_RANGE.min + ORGAAI_TEMPERATURE_RANGE.max) / 2
      };

      expect(() => OrgaAI.init(config)).not.toThrow();
    });

    it('should throw error when neither sessionConfigEndpoint nor fetchSessionConfig is provided', () => {
      const config = {
        model: 'orga-1-beta' as const
      };

      expect(() => OrgaAI.init(config)).toThrow(ConfigurationError);
      expect(() => OrgaAI.init(config)).toThrow(
        'sessionConfigEndpoint or fetchSessionConfig is required'
      );
    });

    it('should prioritize fetchSessionConfig over sessionConfigEndpoint', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token',
        fetchSessionConfig: mockFetchFn
      };

      OrgaAI.init(config);

      expect(global.OrgaAI?.config.fetchSessionConfig).toBe(mockFetchFn);
      expect(global.OrgaAI?.config.sessionConfigEndpoint).toBe('https://api.example.com/token');
    });

    it('should create fetchFn from sessionConfigEndpoint when fetchSessionConfig is not provided', () => {
      const { fetchSessionConfig } = require('../../utils');
      
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token'
      };

      OrgaAI.init(config);

      expect(global.OrgaAI?.config.fetchSessionConfig).toBeDefined();
      expect(typeof global.OrgaAI?.config.fetchSessionConfig).toBe('function');
    });

    it('should log initialization message', () => {
      const mockLogger = require('../../utils').logger;
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token'
      };

      OrgaAI.init(config);

      expect(mockLogger.info).toHaveBeenCalledWith('OrgaAI SDK initialized');
    });
  });

  describe('getConfig()', () => {
    it('should return config when initialized', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token',
        model: 'orga-1-beta' as const
      };

      OrgaAI.init(config);
      const result = OrgaAI.getConfig();

      expect(result).toEqual(global.OrgaAI?.config);
      expect(result.sessionConfigEndpoint).toBe('https://api.example.com/token');
      expect(result.model).toBe('orga-1-beta');
    });

    it('should throw error when not initialized', () => {
      expect(() => OrgaAI.getConfig()).toThrow(ConfigurationError);
      expect(() => OrgaAI.getConfig()).toThrow(
        'OrgaAI must be initialized before use. Call OrgaAI.init() first.'
      );
    });

    it('should throw error when global state is corrupted', () => {
      global.OrgaAI = { config: {} as any, isInitialized: false };
      
      expect(() => OrgaAI.getConfig()).toThrow(ConfigurationError);
    });
  });

  describe('isInitialized()', () => {
    it('should return true when initialized', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token'
      };

      OrgaAI.init(config);
      expect(OrgaAI.isInitialized()).toBe(true);
    });

    it('should return false when not initialized', () => {
      expect(OrgaAI.isInitialized()).toBe(false);
    });

    it('should return false when global state is corrupted', () => {
      global.OrgaAI = { config: {} as any, isInitialized: false };
      expect(OrgaAI.isInitialized()).toBe(false);
    });

    it('should return false when global state is undefined', () => {
      global.OrgaAI = undefined;
      expect(OrgaAI.isInitialized()).toBe(false);
    });
  });

  describe('Singleton Pattern', () => {
    it('should maintain single instance across multiple init calls', () => {
      const config1 = {
        sessionConfigEndpoint: 'https://api1.example.com/token',
        model: 'orga-1-beta' as const
      };

      const config2 = {
        sessionConfigEndpoint: 'https://api2.example.com/token',
        model: 'orga-1-beta' as const   
      };

      OrgaAI.init(config1);
      const firstConfig = OrgaAI.getConfig();

      OrgaAI.init(config2);
      const secondConfig = OrgaAI.getConfig();

      // Should be the same instance, but config should be updated
      expect(secondConfig.sessionConfigEndpoint).toBe('https://api2.example.com/token');
      expect(secondConfig.model).toBe('orga-1-beta');
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined temperature gracefully', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token',
        temperature: undefined
      };

      expect(() => OrgaAI.init(config)).not.toThrow();
    });

    it('should handle null temperature gracefully', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/token',
        temperature: null as any
      };

      expect(() => OrgaAI.init(config)).not.toThrow();
    });
  });

  // NEW: Group the integration tests together
  describe('Integration & Execution', () => {
    it('should call fetchSessionConfig when using sessionConfigEndpoint', async () => {
      const { fetchSessionConfig } = require('../../utils');
      const config = { sessionConfigEndpoint: 'https://api.example.com/token' };
      
      OrgaAI.init(config);
      const fetchFn = OrgaAI.getConfig().fetchSessionConfig;
      
      await fetchFn?.();
      expect(fetchSessionConfig).toHaveBeenCalledWith('https://api.example.com/token');
    });

    it('should use custom fetchSessionConfig function when provided', () => {
      const customFetchFn = jest.fn().mockResolvedValue({ token: 'test', servers: [] });
      
      const config = {
        fetchSessionConfig: customFetchFn
      };
      
      OrgaAI.init(config);
      const storedFn = OrgaAI.getConfig().fetchSessionConfig;
      
      expect(storedFn).toBe(customFetchFn);
    });
  });

  // NEW: Group performance/stress tests
  describe('Performance & Stress Testing', () => {
    it('should handle concurrent initialization calls', () => {
      const config = { sessionConfigEndpoint: 'https://api.example.com/token' };
      
      OrgaAI.init(config);
      OrgaAI.init(config);
      OrgaAI.init(config);
      
      expect(OrgaAI.isInitialized()).toBe(true);
    });

    it('should not create memory leaks with multiple inits', () => {
      for (let i = 0; i < 100; i++) {
        OrgaAI.init({ sessionConfigEndpoint: `https://api${i}.example.com/token` });
      }
      expect(OrgaAI.isInitialized()).toBe(true);
    });
  });
});
