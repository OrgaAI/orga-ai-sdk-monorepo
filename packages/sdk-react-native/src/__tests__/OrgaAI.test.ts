import { OrgaAI } from '../core/OrgaAI';
import { ConfigurationError } from '../errors';

// Mock the logger to avoid side effects
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  fetchEphemeralTokenAndIceServers: jest.fn(() => Promise.resolve('mock-token')),
}));

const { fetchEphemeralTokenAndIceServers } = require('../utils');

describe('OrgaAI', () => {
  beforeEach(() => {
    // Reset global state before each test
    // @ts-ignore
    global.OrgaAI = undefined;
    jest.clearAllMocks();
  });

  it('throws ConfigurationError if neither ephemeralEndpoint nor fetchEphemeralTokenAndIceServers is provided', () => {
    expect(() => OrgaAI.init({ logLevel: 'info', timeout: 1000 } as any)).toThrow(ConfigurationError);
  });

  it('initializes with ephemeralEndpoint', () => {
    OrgaAI.init({ ephemeralEndpoint: 'https://test.com/ephemeral' });
    expect(OrgaAI.isInitialized()).toBe(true);
    const config = OrgaAI.getConfig();
    expect(config.ephemeralEndpoint).toBe('https://test.com/ephemeral');
    expect(typeof config.fetchEphemeralTokenAndIceServers).toBe('function');
  });

  it('initializes with fetchEphemeralTokenAndIceServers', () => {
    const customFetch = jest.fn();
    OrgaAI.init({ fetchEphemeralTokenAndIceServers: customFetch });
    expect(OrgaAI.isInitialized()).toBe(true);
    const config = OrgaAI.getConfig();
    expect(config.fetchEphemeralTokenAndIceServers).toBe(customFetch);
  });

  it('applies default config values', () => {
    OrgaAI.init({ ephemeralEndpoint: 'https://test.com/ephemeral' });
    const config = OrgaAI.getConfig();
    expect(config.logLevel).toBe('warn');
    expect(config.timeout).toBe(30000);
  });

  it('overrides default config values', () => {
    OrgaAI.init({ ephemeralEndpoint: 'https://test.com/ephemeral', logLevel: 'debug', timeout: 12345 });
    const config = OrgaAI.getConfig();
    expect(config.logLevel).toBe('debug');
    expect(config.timeout).toBe(12345);
  });

  it('getConfig throws if not initialized', () => {
    expect(() => OrgaAI.getConfig()).toThrow(ConfigurationError);
  });

  it('isInitialized returns false if not initialized', () => {
    expect(OrgaAI.isInitialized()).toBe(false);
  });

  it('logger.info is called on init', () => {
    const { logger } = require('../utils');
    OrgaAI.init({ ephemeralEndpoint: 'https://test.com/ephemeral' });
    expect(logger.info).toHaveBeenCalledWith('OrgaAI SDK initialized');
  });
});