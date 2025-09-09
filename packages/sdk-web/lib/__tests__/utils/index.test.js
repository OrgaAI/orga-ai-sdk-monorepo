"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
// Mock fetch globally
global.fetch = jest.fn();
// Mock console methods
const mockConsole = {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
jest.spyOn(console, 'log').mockImplementation(mockConsole.log);
jest.spyOn(console, 'info').mockImplementation(mockConsole.info);
jest.spyOn(console, 'warn').mockImplementation(mockConsole.warn);
jest.spyOn(console, 'error').mockImplementation(mockConsole.error);
describe('Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset global state
        global.OrgaAI = undefined;
    });
    afterEach(() => {
        // Clean up global state
        global.OrgaAI = undefined;
    });
    describe('getMediaConstraints', () => {
        it('should return medium quality constraints by default', () => {
            const constraints = (0, utils_1.getMediaConstraints)();
            expect(constraints.audio).toBe(false);
            expect(constraints.video).toEqual({
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
                frameRate: { min: 24, ideal: 30, max: 30 },
            });
        });
        it('should return low quality constraints', () => {
            const constraints = (0, utils_1.getMediaConstraints)({ videoQuality: 'low' });
            expect(constraints.audio).toBe(false);
            expect(constraints.video).toEqual({
                width: { min: 320, ideal: 640, max: 1280 },
                height: { min: 240, ideal: 480, max: 720 },
                frameRate: { min: 15, ideal: 24, max: 30 },
            });
        });
        it('should return high quality constraints', () => {
            const constraints = (0, utils_1.getMediaConstraints)({ videoQuality: 'high' });
            expect(constraints.audio).toBe(false);
            expect(constraints.video).toEqual({
                width: { min: 1280, ideal: 1920, max: 2560 },
                height: { min: 720, ideal: 1080, max: 1440 },
                frameRate: { min: 30, ideal: 30, max: 30 },
            });
        });
        it('should handle empty config', () => {
            const constraints = (0, utils_1.getMediaConstraints)({});
            expect(constraints.audio).toBe(false);
            expect(constraints.video).toBeDefined();
        });
        it('should handle undefined config', () => {
            const constraints = (0, utils_1.getMediaConstraints)();
            expect(constraints.audio).toBe(false);
            expect(constraints.video).toBeDefined();
        });
    });
    describe('fetchSessionConfig', () => {
        it('should fetch and return valid data', async () => {
            const mockResponse = {
                ephemeralToken: 'test-token-123',
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse)
            });
            const result = await (0, utils_1.fetchSessionConfig)('https://api.example.com/token');
            expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/token');
            expect(result).toEqual(mockResponse);
        });
        it('should throw error on non-ok response', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });
            await expect((0, utils_1.fetchSessionConfig)('https://api.example.com/token')).rejects.toThrow('Failed to fetch ephemeral token: 500 Internal Server Error');
        });
        it('should throw error on missing ephemeralToken', async () => {
            const mockResponse = {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse)
            });
            await expect((0, utils_1.fetchSessionConfig)('https://api.example.com/token')).rejects.toThrow('Invalid response from ephemeral token endpoint');
        });
        it('should throw error on missing iceServers', async () => {
            const mockResponse = {
                ephemeralToken: 'test-token-123'
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse)
            });
            await expect((0, utils_1.fetchSessionConfig)('https://api.example.com/token')).rejects.toThrow('Invalid response from ephemeral token endpoint');
        });
        it('should throw error on network failure', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            await expect((0, utils_1.fetchSessionConfig)('https://api.example.com/token')).rejects.toThrow('Network error');
        });
    });
    describe('connectToRealtime', () => {
        const mockPeerConnection = {
            localDescription: {
                sdp: 'mock-sdp',
                type: 'offer'
            }
        };
        const mockConfig = {
            voice: 'alloy',
            model: 'orga-1-beta',
            temperature: 0.7,
            enableTranscriptions: true,
            instructions: 'Test instructions',
            modalities: ['audio', 'video']
        };
        beforeEach(() => {
            // Mock OrgaAI.getConfig
            global.OrgaAI = {
                config: mockConfig,
                isInitialized: true
            };
        });
        it('should connect successfully with valid data', async () => {
            const mockResponse = {
                answer: { sdp: 'answer-sdp', type: 'answer' },
                conversation_id: 'conv-123'
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse)
            });
            const result = await (0, utils_1.connectToRealtime)({
                ephemeralToken: 'test-token',
                peerConnection: mockPeerConnection,
                gathered: [{ candidate: 'test-candidate' }]
            });
            expect(global.fetch).toHaveBeenCalledWith('https://staging.orga-ai.com/realtime', expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token'
                }
            }));
            expect(result).toEqual({
                conversation_id: 'conv-123',
                answer: { sdp: 'answer-sdp', type: 'answer' }
            });
        });
        it('should use default values when config values are missing', async () => {
            global.OrgaAI = {
                config: {},
                isInitialized: true
            };
            const mockResponse = {
                answer: { sdp: 'answer-sdp', type: 'answer' },
                conversation_id: 'conv-123'
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse)
            });
            await (0, utils_1.connectToRealtime)({
                ephemeralToken: 'test-token',
                peerConnection: mockPeerConnection,
                gathered: []
            });
            const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
            expect(requestBody.params.voice).toBe('alloy');
            expect(requestBody.params.model).toBe('orga-1-beta');
            expect(requestBody.params.temperature).toBe(0.5);
            expect(requestBody.params.return_transcription).toBe(false);
            expect(requestBody.params.instructions).toBe(null);
            expect(requestBody.params.modalities).toEqual(['audio', 'video']);
        });
        it('should throw error on non-ok response', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized'
            });
            await expect((0, utils_1.connectToRealtime)({
                ephemeralToken: 'test-token',
                peerConnection: mockPeerConnection,
                gathered: []
            })).rejects.toThrow('Failed to connect to realtime: 401 Unauthorized');
        });
        it('should throw error on missing answer in response', async () => {
            const mockResponse = {
                conversation_id: 'conv-123'
            };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse)
            });
            await expect((0, utils_1.connectToRealtime)({
                ephemeralToken: 'test-token',
                peerConnection: mockPeerConnection,
                gathered: []
            })).rejects.toThrow('No answer in response');
        });
        it('should handle timeout correctly', async () => {
            global.fetch.mockImplementationOnce(() => new Promise((_, reject) => {
                setTimeout(() => {
                    const abortError = new Error('AbortError');
                    abortError.name = 'AbortError';
                    reject(abortError);
                }, 100);
            }));
            await expect((0, utils_1.connectToRealtime)({
                ephemeralToken: 'test-token',
                peerConnection: mockPeerConnection,
                gathered: []
            })).rejects.toThrow('Request timeout: Failed to connect to realtime within 10 seconds');
        });
        it('should handle network errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            await expect((0, utils_1.connectToRealtime)({
                ephemeralToken: 'test-token',
                peerConnection: mockPeerConnection,
                gathered: []
            })).rejects.toThrow('Network error');
        });
    });
    describe('logger', () => {
        beforeEach(() => {
            // Reset console mocks
            jest.clearAllMocks();
        });
        describe('debug', () => {
            it('should log when logLevel is debug', () => {
                global.OrgaAI = {
                    config: { logLevel: 'debug' },
                    isInitialized: true
                };
                utils_1.logger.debug('Test debug message', 'arg1', 'arg2');
                expect(mockConsole.log).toHaveBeenCalledWith('[OrgaAI Debug] Test debug message', 'arg1', 'arg2');
            });
            it('should not log when logLevel is not debug', () => {
                global.OrgaAI = {
                    config: { logLevel: 'info' },
                    isInitialized: true
                };
                utils_1.logger.debug('Test debug message');
                expect(mockConsole.log).not.toHaveBeenCalled();
            });
            it('should use disabled as default when no config', () => {
                utils_1.logger.debug('Test debug message');
                expect(mockConsole.log).not.toHaveBeenCalled();
            });
        });
        describe('info', () => {
            it('should log when logLevel is info', () => {
                global.OrgaAI = {
                    config: { logLevel: 'info' },
                    isInitialized: true
                };
                utils_1.logger.info('Test info message');
                expect(mockConsole.info).toHaveBeenCalledWith('[OrgaAI Info] Test info message');
            });
            it('should log when logLevel is debug', () => {
                global.OrgaAI = {
                    config: { logLevel: 'debug' },
                    isInitialized: true
                };
                utils_1.logger.info('Test info message');
                expect(mockConsole.info).toHaveBeenCalledWith('[OrgaAI Info] Test info message');
            });
            it('should not log when logLevel is warn', () => {
                global.OrgaAI = {
                    config: { logLevel: 'warn' },
                    isInitialized: true
                };
                utils_1.logger.info('Test info message');
                expect(mockConsole.info).not.toHaveBeenCalled();
            });
        });
        describe('warn', () => {
            it('should log when logLevel is warn', () => {
                global.OrgaAI = {
                    config: { logLevel: 'warn' },
                    isInitialized: true
                };
                utils_1.logger.warn('Test warn message');
                expect(mockConsole.warn).toHaveBeenCalledWith('[OrgaAI Warn] Test warn message');
            });
            it('should log when logLevel is info', () => {
                global.OrgaAI = {
                    config: { logLevel: 'info' },
                    isInitialized: true
                };
                utils_1.logger.warn('Test warn message');
                expect(mockConsole.warn).toHaveBeenCalledWith('[OrgaAI Warn] Test warn message');
            });
            it('should not log when logLevel is error', () => {
                global.OrgaAI = {
                    config: { logLevel: 'error' },
                    isInitialized: true
                };
                utils_1.logger.warn('Test warn message');
                expect(mockConsole.warn).not.toHaveBeenCalled();
            });
        });
        describe('error', () => {
            it('should log when logLevel is error', () => {
                global.OrgaAI = {
                    config: { logLevel: 'error' },
                    isInitialized: true
                };
                utils_1.logger.error('Test error message');
                expect(mockConsole.error).toHaveBeenCalledWith('[OrgaAI Error] Test error message');
            });
            it('should log when logLevel is debug', () => {
                global.OrgaAI = {
                    config: { logLevel: 'debug' },
                    isInitialized: true
                };
                utils_1.logger.error('Test error message');
                expect(mockConsole.error).toHaveBeenCalledWith('[OrgaAI Error] Test error message');
            });
            it('should not log when logLevel is disabled', () => {
                global.OrgaAI = {
                    config: { logLevel: 'disabled' },
                    isInitialized: true
                };
                utils_1.logger.error('Test error message');
                expect(mockConsole.error).not.toHaveBeenCalled();
            });
            it('should use disabled as default when no config', () => {
                utils_1.logger.error('Test error message');
                expect(mockConsole.error).not.toHaveBeenCalled();
            });
        });
    });
});
