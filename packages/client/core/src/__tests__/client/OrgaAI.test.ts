import { OrgaAI } from '../../client/OrgaAI';
import { ConfigurationError } from '../../errors';

describe('OrgaAI Client', () => {
  beforeEach(() => {
    // Reset global state before each test
    OrgaAI.reset();
  });

  describe('init', () => {
    it('should initialize with valid config', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/session',
        logLevel: 'info' as const,
      };

      OrgaAI.init(config);

      expect(OrgaAI.isInitialized()).toBe(true);
      expect(OrgaAI.getConfig()).toMatchObject({
        sessionConfigEndpoint: 'https://api.example.com/session',
        logLevel: 'info',
        timeout: 30000,
      });
    });

    it('should initialize with custom fetchSessionConfig', () => {
      const fetchSessionConfig = jest.fn().mockResolvedValue({
        ephemeralToken: 'test-token',
        iceServers: [],
      });

      OrgaAI.init({
        fetchSessionConfig,
        logLevel: 'debug',
      });

      expect(OrgaAI.isInitialized()).toBe(true);
      expect(OrgaAI.getConfig().fetchSessionConfig).toBe(fetchSessionConfig);
    });

    it('should throw error if neither sessionConfigEndpoint nor fetchSessionConfig provided', () => {
      expect(() => {
        OrgaAI.init({
          logLevel: 'info',
        });
      }).toThrow(ConfigurationError);
      
      expect(() => {
        OrgaAI.init({
          logLevel: 'info',
        });
      }).toThrow('Either sessionConfigEndpoint or fetchSessionConfig is required');
    });

    it('should validate temperature range', () => {
      expect(() => {
        OrgaAI.init({
          sessionConfigEndpoint: 'https://api.example.com/session',
          temperature: -0.1,
        });
      }).toThrow(ConfigurationError);

      expect(() => {
        OrgaAI.init({
          sessionConfigEndpoint: 'https://api.example.com/session',
          temperature: 1.1,
        });
      }).toThrow(ConfigurationError);
    });

    it('should accept valid temperature values', () => {
      OrgaAI.init({
        sessionConfigEndpoint: 'https://api.example.com/session',
        temperature: 0.0,
      });
      expect(OrgaAI.getConfig().temperature).toBe(0.0);

      OrgaAI.reset();

      OrgaAI.init({
        sessionConfigEndpoint: 'https://api.example.com/session',
        temperature: 1.0,
      });
      expect(OrgaAI.getConfig().temperature).toBe(1.0);

      OrgaAI.reset();

      OrgaAI.init({
        sessionConfigEndpoint: 'https://api.example.com/session',
        temperature: 0.5,
      });
      expect(OrgaAI.getConfig().temperature).toBe(0.5);
    });

    it('should merge default config with user config', () => {
      OrgaAI.init({
        sessionConfigEndpoint: 'https://api.example.com/session',
        model: 'orga-1-beta',
        voice: 'Sofía',
      });

      const config = OrgaAI.getConfig();
      expect(config.logLevel).toBe('warn'); // default
      expect(config.timeout).toBe(30000); // default
      expect(config.model).toBe('orga-1-beta');
      expect(config.voice).toBe('Sofía');
    });
  });

  describe('getConfig', () => {
    it('should return config when initialized', () => {
      const config = {
        sessionConfigEndpoint: 'https://api.example.com/session',
      };
      
      OrgaAI.init(config);
      
      expect(OrgaAI.getConfig()).toMatchObject(config);
    });

    it('should throw error when not initialized', () => {
      expect(() => {
        OrgaAI.getConfig();
      }).toThrow(ConfigurationError);
      
      expect(() => {
        OrgaAI.getConfig();
      }).toThrow('OrgaAI must be initialized before use');
    });
  });

  describe('isInitialized', () => {
    it('should return false when not initialized', () => {
      expect(OrgaAI.isInitialized()).toBe(false);
    });

    it('should return true when initialized', () => {
      OrgaAI.init({
        sessionConfigEndpoint: 'https://api.example.com/session',
      });
      
      expect(OrgaAI.isInitialized()).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset initialization state', () => {
      OrgaAI.init({
        sessionConfigEndpoint: 'https://api.example.com/session',
      });
      
      expect(OrgaAI.isInitialized()).toBe(true);
      
      OrgaAI.reset();
      
      expect(OrgaAI.isInitialized()).toBe(false);
    });
  });
});

