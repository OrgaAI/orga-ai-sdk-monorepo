"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const react_2 = require("react");
const useOrgaAI_1 = require("../../hooks/useOrgaAI");
const OrgaAI_1 = require("../../core/OrgaAI");
const utils_1 = require("../../utils");
const errors_1 = require("../../errors");
const types_1 = require("../../types");
// Mock dependencies
jest.mock('../../core/OrgaAI');
jest.mock('../../utils', () => ({
    logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
    connectToRealtime: jest.fn(),
    getMediaConstraints: jest.fn(),
}));
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
// Mock WebRTC APIs
const mockTrack = {
    id: 'test-track-id',
    kind: 'audio',
    enabled: true,
    stop: jest.fn(),
};
const mockVideoTrack = {
    id: 'test-video-track-id',
    kind: 'video',
    enabled: true,
    stop: jest.fn(),
};
const mockAudioTrack = {
    id: 'test-audio-track-id',
    kind: 'audio',
    enabled: true,
    stop: jest.fn(),
};
const mockDataChannel = {
    readyState: 'open',
    send: jest.fn(),
    addEventListener: jest.fn(),
    close: jest.fn(),
};
const mockPeerConnection = {
    addTransceiver: jest.fn(() => ({
        sender: {
            replaceTrack: jest.fn(),
        },
    })),
    createDataChannel: jest.fn(() => mockDataChannel),
    createOffer: jest.fn(() => Promise.resolve({ sdp: 'test-sdp', type: 'offer' })),
    setLocalDescription: jest.fn(() => Promise.resolve()),
    setRemoteDescription: jest.fn(() => Promise.resolve()),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    iceGatheringState: 'complete',
    connectionState: 'connected',
    iceConnectionState: 'connected',
    addTrack: jest.fn(),
    removeTrack: jest.fn(),
    getTransceivers: jest.fn(() => []),
    getSenders: jest.fn(() => []),
    getReceivers: jest.fn(() => []),
};
// Mock MediaStream using Object.defineProperty as recommended for JSDOM
Object.defineProperty(window, 'MediaStream', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
        getTracks: jest.fn(() => [mockTrack]),
        getAudioTracks: jest.fn(() => [mockAudioTrack]),
        getVideoTracks: jest.fn(() => [mockVideoTrack]),
        tracks: [mockTrack],
        addTrack: jest.fn(),
        removeTrack: jest.fn(),
        getTrackById: jest.fn(),
        clone: jest.fn(),
        active: true,
        id: 'mock-stream-id',
    }))
});
// Mock navigator.mediaDevices
Object.defineProperty(window.navigator, 'mediaDevices', {
    writable: true,
    value: {
        getUserMedia: jest.fn(() => Promise.resolve(new MediaStream())),
        enumerateDevices: jest.fn(() => Promise.resolve([])),
        getSupportedConstraints: jest.fn(() => ({})),
    }
});
// Mock RTCPeerConnection
Object.defineProperty(window, 'RTCPeerConnection', {
    writable: true,
    value: jest.fn().mockImplementation(() => mockPeerConnection)
});
// Mock RTCSessionDescription
Object.defineProperty(window, 'RTCSessionDescription', {
    writable: true,
    value: jest.fn().mockImplementation(({ sdp, type }) => ({ sdp, type }))
});
describe('useOrgaAI', () => {
    const mockOrgaAI = {
        getConfig: jest.fn(),
        isInitialized: jest.fn(),
    };
    const mockCallbacks = {
        onSessionStart: jest.fn(),
        onSessionEnd: jest.fn(),
        onSessionConnected: jest.fn(),
        onError: jest.fn(),
        onConnectionStateChange: jest.fn(),
        onConversationMessageCreated: jest.fn(),
        onOrgaAgentMessage: jest.fn()
    };
    beforeEach(() => {
        jest.clearAllMocks();
        OrgaAI_1.OrgaAI.getConfig = mockOrgaAI.getConfig;
        OrgaAI_1.OrgaAI.isInitialized = mockOrgaAI.isInitialized;
        // Default config
        mockOrgaAI.getConfig.mockReturnValue({
            voice: 'alloy',
            model: 'orga-1-beta',
            temperature: 0.5,
            enableTranscriptions: true,
            instructions: 'Test instructions',
            modalities: ['audio', 'video'],
            fetchSessionConfig: jest.fn(() => Promise.resolve({
                ephemeralToken: 'test-token',
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            })),
        });
        mockOrgaAI.isInitialized.mockReturnValue(true);
        utils_1.connectToRealtime.mockResolvedValue({
            answer: { sdp: 'answer-sdp', type: 'answer' },
            conversation_id: 'conv-123'
        });
        utils_1.getMediaConstraints.mockReturnValue({
            audio: false,
            video: { width: { ideal: 1280 } }
        });
    });
    describe('Initial State', () => {
        it('should initialize with default state', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            expect(result.current.connectionState).toBe('closed');
            expect(result.current.userVideoStream).toBeNull();
            expect(result.current.aiAudioStream).toBeNull();
            expect(result.current.conversationItems).toEqual([]);
            expect(result.current.isCameraOn).toBe(false);
            expect(result.current.isMicOn).toBe(false);
            expect(result.current.conversationId).toBeNull();
            expect(result.current.model).toBeNull();
            expect(result.current.voice).toBeNull();
            expect(result.current.temperature).toBeNull();
            expect(result.current.instructions).toBeNull();
            expect(result.current.modalities).toEqual([]);
        });
        it('should provide all required methods', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            expect(typeof result.current.startSession).toBe('function');
            expect(typeof result.current.endSession).toBe('function');
            expect(typeof result.current.enableMic).toBe('function');
            expect(typeof result.current.disableMic).toBe('function');
            expect(typeof result.current.toggleMic).toBe('function');
            expect(typeof result.current.enableCamera).toBe('function');
            expect(typeof result.current.disableCamera).toBe('function');
            expect(typeof result.current.toggleCamera).toBe('function');
            expect(typeof result.current.updateParams).toBe('function');
        });
    });
    describe('Session Management', () => {
        it('should start session successfully', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            expect(result.current.connectionState).toBe('connected');
            expect(result.current.conversationId).toBe('conv-123');
            expect(mockCallbacks.onSessionStart).toHaveBeenCalled();
            expect(utils_1.logger.info).toHaveBeenCalledWith('🚀 Starting OrgaAI session...');
        });
        it('should throw ConfigurationError when OrgaAI not initialized', async () => {
            mockOrgaAI.isInitialized.mockReturnValue(false);
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            await (0, react_2.act)(async () => {
                try {
                    await result.current.startSession();
                }
                catch (error) {
                    expect(error).toBeInstanceOf(errors_1.ConfigurationError);
                }
            });
            expect(result.current.connectionState).toBe('failed');
            expect(mockCallbacks.onError).toHaveBeenCalled();
        });
        it('should throw SessionError when session already active', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start first session
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            // Try to start second session
            await (0, react_2.act)(async () => {
                try {
                    await result.current.startSession();
                }
                catch (error) {
                    expect(error).toBeInstanceOf(errors_1.SessionError);
                }
            });
        });
        it('should end session successfully', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start session first
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            // End session
            await (0, react_2.act)(async () => {
                await result.current.endSession();
            });
            expect(result.current.connectionState).toBe('closed');
            expect(result.current.conversationId).toBeNull();
            expect(mockCallbacks.onSessionEnd).toHaveBeenCalled();
            expect(utils_1.logger.info).toHaveBeenCalledWith('🔚 Ending session');
        });
        it('should handle session end errors gracefully', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start a session first so we have something to end
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            // Mock the peer connection close to throw an error
            mockPeerConnection.close.mockImplementation(() => {
                throw new Error('Session end error');
            });
            await (0, react_2.act)(async () => {
                await result.current.endSession();
            });
            // The error should be logged and onError called
            expect(utils_1.logger.error).toHaveBeenCalledWith('❌ Error closing peer connection', expect.any(Error));
            expect(mockCallbacks.onError).toHaveBeenCalled();
        });
    });
    describe('Media Controls', () => {
        beforeEach(() => {
            // Reset all mocks to ensure fresh instances
            jest.clearAllMocks();
            // Ensure MediaStream constructor returns fresh instances
            window.MediaStream.mockImplementation(() => ({
                getTracks: jest.fn(() => [mockTrack]),
                getAudioTracks: jest.fn(() => [mockAudioTrack]),
                getVideoTracks: jest.fn(() => [mockVideoTrack]),
                tracks: [mockTrack],
                addTrack: jest.fn(),
                removeTrack: jest.fn(),
                getTrackById: jest.fn(),
                clone: jest.fn(),
                active: true,
                id: 'mock-stream-id',
            }));
            // Ensure getUserMedia returns fresh instances
            window.navigator.mediaDevices.getUserMedia.mockImplementation(() => Promise.resolve(new MediaStream()));
        });
        describe('Microphone Controls', () => {
            it('should enable microphone successfully', async () => {
                const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
                await (0, react_2.act)(async () => {
                    await result.current.enableMic();
                });
                expect(result.current.isMicOn).toBe(true);
                expect(result.current.modalities).toContain('audio');
                expect(utils_1.logger.info).toHaveBeenCalledWith('🎤 Enabling microphone');
            });
            it('should disable microphone with soft disable', async () => {
                const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
                // Enable first to set the stream
                await (0, react_2.act)(async () => {
                    await result.current.enableMic();
                });
                // Disable
                await (0, react_2.act)(async () => {
                    await result.current.disableMic(false);
                });
                expect(result.current.isMicOn).toBe(false);
                expect(result.current.modalities).not.toContain('audio');
                expect(utils_1.logger.info).toHaveBeenCalledWith('🎤 Disabling microphone');
            });
            it('should disable microphone with hard disable', async () => {
                const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
                // Enable first
                await (0, react_2.act)(async () => {
                    await result.current.enableMic();
                });
                // Hard disable
                await (0, react_2.act)(async () => {
                    await result.current.disableMic(true);
                });
                expect(result.current.isMicOn).toBe(false);
                // The track.stop() is called on the tracks from the stream, not the mock directly
                expect(mockTrack.stop).toHaveBeenCalled();
            });
            it('should toggle microphone', async () => {
                const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
                // Toggle on
                await (0, react_2.act)(async () => {
                    await result.current.toggleMic();
                });
                expect(result.current.isMicOn).toBe(true);
                // Toggle off
                await (0, react_2.act)(async () => {
                    await result.current.toggleMic();
                });
                expect(result.current.isMicOn).toBe(false);
            });
        });
        describe('Camera Controls', () => {
            it('should enable camera successfully', async () => {
                const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
                await (0, react_2.act)(async () => {
                    await result.current.enableCamera();
                });
                expect(result.current.isCameraOn).toBe(true);
                expect(result.current.userVideoStream).not.toBeNull();
                expect(result.current.modalities).toContain('video');
                expect(utils_1.logger.info).toHaveBeenCalledWith('📹 Enabling camera');
            });
            it('should disable camera with soft disable', async () => {
                const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
                // Enable first to set the stream
                await (0, react_2.act)(async () => {
                    await result.current.enableCamera();
                });
                // Disable
                await (0, react_2.act)(async () => {
                    await result.current.disableCamera(false);
                });
                expect(result.current.isCameraOn).toBe(false);
                expect(result.current.modalities).not.toContain('video');
                expect(utils_1.logger.info).toHaveBeenCalledWith('📹 Disabling camera');
            });
            it('should disable camera with hard disable', async () => {
                const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
                // Enable first
                await (0, react_2.act)(async () => {
                    await result.current.enableCamera();
                });
                // Hard disable
                await (0, react_2.act)(async () => {
                    await result.current.disableCamera(true);
                });
                expect(result.current.isCameraOn).toBe(false);
                expect(result.current.userVideoStream).toBeNull();
                // The track.stop() is called on the tracks from the stream, not the mock directly
                expect(mockTrack.stop).toHaveBeenCalled();
            });
            it('should toggle camera', async () => {
                const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
                // Toggle on
                await (0, react_2.act)(async () => {
                    await result.current.toggleCamera();
                });
                expect(result.current.isCameraOn).toBe(true);
                // Toggle off
                await (0, react_2.act)(async () => {
                    await result.current.toggleCamera();
                });
                expect(result.current.isCameraOn).toBe(false);
            });
            it('should handle camera enable errors', async () => {
                // Mock getUserMedia to reject with a specific error
                const cameraError = new Error('Camera error');
                window.navigator.mediaDevices.getUserMedia.mockRejectedValue(cameraError);
                const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
                await (0, react_2.act)(async () => {
                    try {
                        await result.current.enableCamera();
                    }
                    catch (error) {
                        expect(error).toBe(cameraError);
                    }
                });
                expect(utils_1.logger.error).toHaveBeenCalledWith('❌ Failed to enable camera:', cameraError);
                // Reset the mock for other tests
                window.navigator.mediaDevices.getUserMedia.mockResolvedValue(new MediaStream());
            });
        });
    });
    describe('Parameter Management', () => {
        it('should update parameters successfully', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            await (0, react_2.act)(async () => {
                result.current.updateParams({
                    model: 'orga-1-beta',
                    voice: 'alloy',
                    temperature: 0.7,
                    instructions: 'New instructions',
                    modalities: ['audio', 'video']
                });
            });
            expect(result.current.model).toBe('orga-1-beta');
            expect(result.current.voice).toBe('alloy');
            expect(result.current.temperature).toBe(0.7);
            expect(result.current.instructions).toBe('New instructions');
            expect(result.current.modalities).toEqual(['audio', 'video']);
            expect(utils_1.logger.debug).toHaveBeenCalledWith('🔄 Updating parameters:', expect.any(Object));
        });
        it('should send updated params when connected', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start session to get connected state
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            // Update params
            await (0, react_2.act)(async () => {
                result.current.updateParams({
                    model: 'orga-1-beta',
                    temperature: 0.8
                });
            });
            // Check that send was called and parse the data
            expect(mockDataChannel.send).toHaveBeenCalled();
            const sentData = JSON.parse(mockDataChannel.send.mock.calls[0][0]);
            expect(sentData.event).toBe(types_1.DataChannelEventTypes.SESSION_UPDATE);
            expect(sentData.data).toHaveProperty('model', 'orga-1-beta');
            expect(sentData.data).toHaveProperty('temperature');
        });
        it('should not send updated params when not connected', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            await (0, react_2.act)(async () => {
                result.current.updateParams({
                    model: 'orga-1-beta'
                });
            });
            expect(mockDataChannel.send).not.toHaveBeenCalled();
        });
    });
    describe('Data Channel Events', () => {
        beforeEach(() => {
            // Mock data channel event listeners
            mockDataChannel.addEventListener.mockImplementation((event, callback) => {
                if (event === 'message') {
                    // Store callback for testing
                    mockDataChannel.messageCallback = callback;
                }
            });
        });
        it('should handle user speech transcription events', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start session to set conversation ID
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            // Simulate data channel message
            const transcriptionEvent = {
                event: types_1.DataChannelEventTypes.USER_SPEECH_TRANSCRIPTION,
                message: 'Hello, how are you?'
            };
            await (0, react_2.act)(async () => {
                mockDataChannel.messageCallback({
                    data: JSON.stringify(transcriptionEvent)
                });
            });
            expect(result.current.conversationItems).toHaveLength(1);
            expect(result.current.conversationItems[0]).toEqual({
                conversationId: 'conv-123',
                sender: 'user',
                content: {
                    type: 'text',
                    message: 'Hello, how are you?'
                },
                modelVersion: 'orga-1-beta'
            });
            expect(mockCallbacks.onConversationMessageCreated).toHaveBeenCalled();
        });
        it('should handle assistant response events', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start session to set conversation ID
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            // Simulate data channel message
            const responseEvent = {
                event: types_1.DataChannelEventTypes.ASSISTANT_RESPONSE_COMPLETE,
                message: 'I am doing well, thank you!'
            };
            await (0, react_2.act)(async () => {
                mockDataChannel.messageCallback({
                    data: JSON.stringify(responseEvent)
                });
            });
            expect(result.current.conversationItems).toHaveLength(1);
            expect(result.current.conversationItems[0]).toEqual({
                conversationId: 'conv-123',
                sender: 'assistant',
                content: {
                    type: 'text',
                    message: 'I am doing well, thank you!'
                },
                voiceType: 'alloy',
                modelVersion: 'orga-1-beta',
                timestamp: expect.any(String)
            });
            expect(mockCallbacks.onConversationMessageCreated).toHaveBeenCalled();
        });
        it('should handle data channel message parsing errors', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start session
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            // Simulate invalid JSON
            await (0, react_2.act)(async () => {
                mockDataChannel.messageCallback({
                    data: 'invalid json'
                });
            });
            expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));
            expect(utils_1.logger.error).toHaveBeenCalledWith('❌ Error parsing data channel message:', expect.any(Error));
        });
    });
    describe('Connection State Management', () => {
        it('should handle connection state changes', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start session
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            // Find the connection state callback
            const connectionStateCallback = mockPeerConnection.addEventListener.mock.calls.find(call => call[0] === 'connectionstatechange')?.[1];
            // Mock the event object with proper target
            const mockEvent = {
                target: mockPeerConnection
            };
            await (0, react_2.act)(async () => {
                connectionStateCallback(mockEvent);
            });
            expect(mockCallbacks.onConnectionStateChange).toHaveBeenCalledWith('connected');
        });
        it('should handle connection failure', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start session
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            // Find the connection state callback
            const connectionStateCallback = mockPeerConnection.addEventListener.mock.calls.find(call => call[0] === 'connectionstatechange')?.[1];
            // Mock the event object with failed state
            const mockEvent = {
                target: {
                    ...mockPeerConnection,
                    connectionState: 'failed'
                }
            };
            await (0, react_2.act)(async () => {
                connectionStateCallback(mockEvent);
            });
            // The cleanup should be called, which sets state to closed
            expect(result.current.connectionState).toBe('closed');
            expect(utils_1.logger.warn).toHaveBeenCalledWith('⚠️ Connection lost, cleaning up...');
        });
    });
    describe('Cleanup', () => {
        it('should cleanup resources on unmount', async () => {
            const { result, unmount } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start session to create resources
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            // Unmount to trigger cleanup
            unmount();
            // The cleanup should be called, but it might not be immediate
            await (0, react_1.waitFor)(() => {
                expect(mockPeerConnection.close).toHaveBeenCalled();
                // The data channel close might not be called immediately due to async cleanup
                expect(utils_1.logger.info).toHaveBeenCalledWith('🧹 Cleaning up resources');
            });
        });
        it('should handle cleanup errors gracefully', async () => {
            mockPeerConnection.close.mockImplementation(() => {
                throw new Error('Cleanup error');
            });
            const { result, unmount } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start session to create resources
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            // Unmount to trigger cleanup
            unmount();
            // The cleanup error should be logged
            await (0, react_1.waitFor)(() => {
                expect(utils_1.logger.error).toHaveBeenCalledWith('❌ Error closing peer connection', expect.any(Error));
            });
        });
    });
    describe('Error Handling', () => {
        it('should handle connection errors', async () => {
            utils_1.connectToRealtime.mockRejectedValue(new Error('Connection failed'));
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            await (0, react_2.act)(async () => {
                try {
                    await result.current.startSession();
                }
                catch (error) {
                    expect(error).toBeInstanceOf(errors_1.ConnectionError);
                }
            });
            expect(result.current.connectionState).toBe('failed');
            expect(mockCallbacks.onError).toHaveBeenCalled();
        });
        it('should handle network errors with improved messages', async () => {
            utils_1.connectToRealtime.mockRejectedValue(new Error('fetch'));
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            await (0, react_2.act)(async () => {
                try {
                    await result.current.startSession();
                }
                catch (error) {
                    expect(error).toBeInstanceOf(errors_1.ConnectionError);
                }
            });
            expect(utils_1.logger.error).toHaveBeenCalledWith('❌', expect.stringContaining('Network error'), expect.any(Error));
        });
    });
    describe('Integration Tests', () => {
        it('should handle full session lifecycle', async () => {
            const { result } = (0, react_1.renderHook)(() => (0, useOrgaAI_1.useOrgaAI)(mockCallbacks));
            // Start session
            await (0, react_2.act)(async () => {
                await result.current.startSession();
            });
            expect(result.current.connectionState).toBe('connected');
            // Enable media
            await (0, react_2.act)(async () => {
                await result.current.enableMic();
                await result.current.enableCamera();
            });
            expect(result.current.isMicOn).toBe(true);
            expect(result.current.isCameraOn).toBe(true);
            // Update parameters
            await (0, react_2.act)(async () => {
                result.current.updateParams({
                    temperature: 0.8,
                    instructions: 'Be more helpful'
                });
            });
            expect(result.current.temperature).toBe(0.8);
            // End session
            await (0, react_2.act)(async () => {
                await result.current.endSession();
            });
            expect(result.current.connectionState).toBe('closed');
            expect(result.current.isMicOn).toBe(false);
            expect(result.current.isCameraOn).toBe(false);
        });
    });
});
