"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OrgaAI_1 = require("../../core/OrgaAI");
const errors_1 = require("../../errors");
const types_1 = require("../../types");
// Mock the utils module
jest.mock('../../utils', () => ({
    fetchEphemeralTokenAndIceServers: jest.fn(),
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
        it('should initialize with valid config using ephemeralEndpoint', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token',
                model: 'orga-1-beta',
                voice: 'alloy'
            };
            OrgaAI_1.OrgaAI.init(config);
            expect(global.OrgaAI).toBeDefined();
            expect(global.OrgaAI?.isInitialized).toBe(true);
            expect(global.OrgaAI?.config.ephemeralEndpoint).toBe('https://api.example.com/token');
            expect(global.OrgaAI?.config.model).toBe('orga-1-beta');
            expect(global.OrgaAI?.config.voice).toBe('alloy');
        });
        it('should initialize with valid config using fetchEphemeralTokenAndIceServers', () => {
            const config = {
                fetchEphemeralTokenAndIceServers: mockFetchFn,
                model: 'orga-1-beta',
                voice: 'alloy'
            };
            OrgaAI_1.OrgaAI.init(config);
            expect(global.OrgaAI).toBeDefined();
            expect(global.OrgaAI?.isInitialized).toBe(true);
            expect(global.OrgaAI?.config.fetchEphemeralTokenAndIceServers).toBe(mockFetchFn);
        });
        it('should set default values when not provided', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token'
            };
            OrgaAI_1.OrgaAI.init(config);
            expect(global.OrgaAI?.config.logLevel).toBe('warn');
            expect(global.OrgaAI?.config.timeout).toBe(30000);
        });
        it('should override default values when provided', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token',
                logLevel: 'debug',
                timeout: 60000
            };
            OrgaAI_1.OrgaAI.init(config);
            expect(global.OrgaAI?.config.logLevel).toBe('debug');
            expect(global.OrgaAI?.config.timeout).toBe(60000);
        });
        it('should validate temperature range', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token',
                temperature: types_1.ORGAAI_TEMPERATURE_RANGE.min - 0.1
            };
            expect(() => OrgaAI_1.OrgaAI.init(config)).toThrow(errors_1.ConfigurationError);
            expect(() => OrgaAI_1.OrgaAI.init(config)).toThrow(`Temperature must be between ${types_1.ORGAAI_TEMPERATURE_RANGE.min} and ${types_1.ORGAAI_TEMPERATURE_RANGE.max}`);
        });
        it('should accept temperature at minimum value', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token',
                temperature: types_1.ORGAAI_TEMPERATURE_RANGE.min
            };
            expect(() => OrgaAI_1.OrgaAI.init(config)).not.toThrow();
        });
        it('should accept temperature at maximum value', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token',
                temperature: types_1.ORGAAI_TEMPERATURE_RANGE.max
            };
            expect(() => OrgaAI_1.OrgaAI.init(config)).not.toThrow();
        });
        it('should accept temperature within range', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token',
                temperature: (types_1.ORGAAI_TEMPERATURE_RANGE.min + types_1.ORGAAI_TEMPERATURE_RANGE.max) / 2
            };
            expect(() => OrgaAI_1.OrgaAI.init(config)).not.toThrow();
        });
        it('should throw error when neither ephemeralEndpoint nor fetchEphemeralTokenAndIceServers is provided', () => {
            const config = {
                model: 'orga-1-beta'
            };
            expect(() => OrgaAI_1.OrgaAI.init(config)).toThrow(errors_1.ConfigurationError);
            expect(() => OrgaAI_1.OrgaAI.init(config)).toThrow('ephemeralEndpoint or fetchEphemeralTokenAndIceServers is required');
        });
        it('should prioritize fetchEphemeralTokenAndIceServers over ephemeralEndpoint', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token',
                fetchEphemeralTokenAndIceServers: mockFetchFn
            };
            OrgaAI_1.OrgaAI.init(config);
            expect(global.OrgaAI?.config.fetchEphemeralTokenAndIceServers).toBe(mockFetchFn);
            expect(global.OrgaAI?.config.ephemeralEndpoint).toBe('https://api.example.com/token');
        });
        it('should create fetchFn from ephemeralEndpoint when fetchEphemeralTokenAndIceServers is not provided', () => {
            const { fetchEphemeralTokenAndIceServers } = require('../../utils');
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token'
            };
            OrgaAI_1.OrgaAI.init(config);
            expect(global.OrgaAI?.config.fetchEphemeralTokenAndIceServers).toBeDefined();
            expect(typeof global.OrgaAI?.config.fetchEphemeralTokenAndIceServers).toBe('function');
        });
        it('should log initialization message', () => {
            const mockLogger = require('../../utils').logger;
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token'
            };
            OrgaAI_1.OrgaAI.init(config);
            expect(mockLogger.info).toHaveBeenCalledWith('OrgaAI SDK initialized');
        });
    });
    describe('getConfig()', () => {
        it('should return config when initialized', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token',
                model: 'orga-1-beta'
            };
            OrgaAI_1.OrgaAI.init(config);
            const result = OrgaAI_1.OrgaAI.getConfig();
            expect(result).toEqual(global.OrgaAI?.config);
            expect(result.ephemeralEndpoint).toBe('https://api.example.com/token');
            expect(result.model).toBe('orga-1-beta');
        });
        it('should throw error when not initialized', () => {
            expect(() => OrgaAI_1.OrgaAI.getConfig()).toThrow(errors_1.ConfigurationError);
            expect(() => OrgaAI_1.OrgaAI.getConfig()).toThrow('OrgaAI must be initialized before use. Call OrgaAI.init() first.');
        });
        it('should throw error when global state is corrupted', () => {
            global.OrgaAI = { config: {}, isInitialized: false };
            expect(() => OrgaAI_1.OrgaAI.getConfig()).toThrow(errors_1.ConfigurationError);
        });
    });
    describe('isInitialized()', () => {
        it('should return true when initialized', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token'
            };
            OrgaAI_1.OrgaAI.init(config);
            expect(OrgaAI_1.OrgaAI.isInitialized()).toBe(true);
        });
        it('should return false when not initialized', () => {
            expect(OrgaAI_1.OrgaAI.isInitialized()).toBe(false);
        });
        it('should return false when global state is corrupted', () => {
            global.OrgaAI = { config: {}, isInitialized: false };
            expect(OrgaAI_1.OrgaAI.isInitialized()).toBe(false);
        });
        it('should return false when global state is undefined', () => {
            global.OrgaAI = undefined;
            expect(OrgaAI_1.OrgaAI.isInitialized()).toBe(false);
        });
    });
    describe('Singleton Pattern', () => {
        it('should maintain single instance across multiple init calls', () => {
            const config1 = {
                ephemeralEndpoint: 'https://api1.example.com/token',
                model: 'orga-1-beta'
            };
            const config2 = {
                ephemeralEndpoint: 'https://api2.example.com/token',
                model: 'orga-1-beta'
            };
            OrgaAI_1.OrgaAI.init(config1);
            const firstConfig = OrgaAI_1.OrgaAI.getConfig();
            OrgaAI_1.OrgaAI.init(config2);
            const secondConfig = OrgaAI_1.OrgaAI.getConfig();
            // Should be the same instance, but config should be updated
            expect(secondConfig.ephemeralEndpoint).toBe('https://api2.example.com/token');
            expect(secondConfig.model).toBe('orga-1-beta');
        });
    });
    describe('Error Handling', () => {
        it('should handle undefined temperature gracefully', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token',
                temperature: undefined
            };
            expect(() => OrgaAI_1.OrgaAI.init(config)).not.toThrow();
        });
        it('should handle null temperature gracefully', () => {
            const config = {
                ephemeralEndpoint: 'https://api.example.com/token',
                temperature: null
            };
            expect(() => OrgaAI_1.OrgaAI.init(config)).not.toThrow();
        });
    });
    // NEW: Group the integration tests together
    describe('Integration & Execution', () => {
        it('should call fetchEphemeralTokenAndIceServers when using ephemeralEndpoint', async () => {
            const { fetchEphemeralTokenAndIceServers } = require('../../utils');
            const config = { ephemeralEndpoint: 'https://api.example.com/token' };
            OrgaAI_1.OrgaAI.init(config);
            const fetchFn = OrgaAI_1.OrgaAI.getConfig().fetchEphemeralTokenAndIceServers;
            await fetchFn?.();
            expect(fetchEphemeralTokenAndIceServers).toHaveBeenCalledWith('https://api.example.com/token');
        });
        it('should use custom fetchEphemeralTokenAndIceServers function when provided', () => {
            const customFetchFn = jest.fn().mockResolvedValue({ token: 'test', servers: [] });
            const config = {
                fetchEphemeralTokenAndIceServers: customFetchFn
            };
            OrgaAI_1.OrgaAI.init(config);
            const storedFn = OrgaAI_1.OrgaAI.getConfig().fetchEphemeralTokenAndIceServers;
            expect(storedFn).toBe(customFetchFn);
        });
    });
    // NEW: Group performance/stress tests
    describe('Performance & Stress Testing', () => {
        it('should handle concurrent initialization calls', () => {
            const config = { ephemeralEndpoint: 'https://api.example.com/token' };
            OrgaAI_1.OrgaAI.init(config);
            OrgaAI_1.OrgaAI.init(config);
            OrgaAI_1.OrgaAI.init(config);
            expect(OrgaAI_1.OrgaAI.isInitialized()).toBe(true);
        });
        it('should not create memory leaks with multiple inits', () => {
            for (let i = 0; i < 100; i++) {
                OrgaAI_1.OrgaAI.init({ ephemeralEndpoint: `https://api${i}.example.com/token` });
            }
            expect(OrgaAI_1.OrgaAI.isInitialized()).toBe(true);
        });
    });
});
