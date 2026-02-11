import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useOrgaAI } from '../../hooks/useOrgaAI';
import { OrgaAI, logger, connectToRealtime, getMediaConstraints, ConnectionError, SessionError, ConfigurationError, DataChannelEventTypes } from '@orga-ai/core';

// Mock dependencies
jest.mock('@orga-ai/core', () => ({
  OrgaAI: {
    init: jest.fn(),
    getConfig: jest.fn(),
    isInitialized: jest.fn(),
  },
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  connectToRealtime: jest.fn(),
  getMediaConstraints: jest.fn(),
  ConnectionError: jest.fn(),
  SessionError: jest.fn(),
  ConfigurationError: jest.fn(),
  DataChannelEventTypes: {
    USER_SPEECH_TRANSCRIPTION: "conversation.item.input_audio_transcription.completed",
    ASSISTANT_RESPONSE_COMPLETE: "response.output_item.done",
    SESSION_UPDATE: "session.update",
    SESSION_CREATED: "session.created",
    CONVERSATION_CREATED: "conversation.created",
  },
  stripEmotionTags: (text: string) => text,
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

const createMockTransceiver = () => {
  const sender: {
    track: MediaStreamTrack | null;
    replaceTrack: jest.Mock;
    getParameters: jest.Mock;
  } = {
    track: null,
    replaceTrack: jest.fn().mockImplementation(async (track: MediaStreamTrack | null) => {
      sender.track = track;
    }),
    getParameters: jest.fn().mockReturnValue({ encodings: [], transactionId: null }),
  };
  return {
    sender,
    direction: 'sendrecv',
  };
};

const mockPeerConnection = {
  addTransceiver: jest.fn(() => createMockTransceiver()),
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (OrgaAI as jest.Mocked<typeof OrgaAI>).getConfig = mockOrgaAI.getConfig;
    (OrgaAI as jest.Mocked<typeof OrgaAI>).isInitialized = mockOrgaAI.isInitialized;
    
    // Default config (use valid voice from ORGAAI_VOICES)
    mockOrgaAI.getConfig.mockReturnValue({
      voice: 'Sofía',
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
    (connectToRealtime as jest.Mock).mockResolvedValue({
      answer: { sdp: 'answer-sdp', type: 'answer' },
      conversation_id: 'conv-123'
    });
    (getMediaConstraints as jest.Mock).mockReturnValue({
      audio: false,
      video: { width: { ideal: 1280 } }
    });
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

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
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

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
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      await act(async () => {
        await result.current.startSession();
      });

      expect(result.current.connectionState).toBe('connected');
      expect(result.current.conversationId).toBe('conv-123');
      expect(mockCallbacks.onSessionStart).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('🚀 Starting OrgaAI session...');
    });

    it('should throw ConfigurationError when OrgaAI not initialized', async () => {
      mockOrgaAI.isInitialized.mockReturnValue(false);
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      await act(async () => {
        try {
          await result.current.startSession();
        } catch (error) {
          expect(error).toBeInstanceOf(ConfigurationError);
        }
      });

      expect(result.current.connectionState).toBe('closed');
      expect(mockCallbacks.onError).toHaveBeenCalled();
    });

    it('should throw SessionError when session already active', async () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start first session
      await act(async () => {
        await result.current.startSession();
      });

      // Try to start second session
      await act(async () => {
        try {
          await result.current.startSession();
        } catch (error) {
          expect(error).toBeInstanceOf(SessionError);
        }
      });
    });

    it('should end session successfully', async () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start session first
      await act(async () => {
        await result.current.startSession();
      });

      // End session
      await act(async () => {
        await result.current.endSession();
      });

      expect(result.current.connectionState).toBe('closed');
      expect(result.current.conversationId).toBeNull();
      expect(mockCallbacks.onSessionEnd).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('🔚 Ending session');
    });

    it('should handle session end errors gracefully', async () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start a session first so we have something to end
      await act(async () => {
        await result.current.startSession();
      });

      // Mock the peer connection close to throw an error
      mockPeerConnection.close.mockImplementation(() => {
        throw new Error('Session end error');
      });

      await act(async () => {
        await result.current.endSession();
      });

      // The error should be logged and onError called
      expect(logger.error).toHaveBeenCalledWith('❌ Error closing peer connection', expect.any(Error));
      expect(mockCallbacks.onError).toHaveBeenCalled();
    });
  });

  describe('Media Controls', () => {
    beforeEach(() => {
      // Reset all mocks to ensure fresh instances
      jest.clearAllMocks();
      
      // Ensure MediaStream constructor returns fresh instances
      (window.MediaStream as jest.Mock).mockImplementation(() => ({
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
      (window.navigator.mediaDevices.getUserMedia as jest.Mock).mockImplementation(() =>
        Promise.resolve(new MediaStream())
      );
    });

    afterEach(() => {
      // Reset getUserMedia to prevent mock leakage (e.g. from camera enable errors test)
      (window.navigator.mediaDevices.getUserMedia as jest.Mock).mockImplementation(() =>
        Promise.resolve(new MediaStream())
      );
    });

    describe('Microphone Controls', () => {
      it('should enable microphone successfully', async () => {
        const { result } = renderHook(() => useOrgaAI(mockCallbacks));

        await act(async () => {
          await result.current.startSession();
        });

        await act(async () => {
          await result.current.enableMic();
        });

        expect(result.current.isMicOn).toBe(true);
        expect(result.current.modalities).toContain('audio');
        expect(logger.info).toHaveBeenCalledWith('🎤 Enabling microphone');
      });

      it('should disable microphone with soft disable', async () => {
        const { result } = renderHook(() => useOrgaAI(mockCallbacks));

        await act(async () => {
          await result.current.startSession();
        });

        // Enable first to set the stream
        await act(async () => {
          await result.current.enableMic();
        });

        // Disable
        await act(async () => {
          await result.current.disableMic(false);
        });

        expect(result.current.isMicOn).toBe(false);
        expect(result.current.modalities).not.toContain('audio');
        expect(logger.info).toHaveBeenCalledWith('🎤 Disabling microphone');
      });

      it('should disable microphone with hard disable', async () => {
        const { result } = renderHook(() => useOrgaAI(mockCallbacks));

        await act(async () => {
          await result.current.startSession();
        });

        // Enable first
        await act(async () => {
          await result.current.enableMic();
        });

        // Hard disable
        await act(async () => {
          await result.current.disableMic(true);
        });

        expect(result.current.isMicOn).toBe(false);
        // The track.stop() is called on the tracks from the stream, not the mock directly
        expect(mockTrack.stop).toHaveBeenCalled();
      });

      it('should toggle microphone', async () => {
        const { result } = renderHook(() => useOrgaAI(mockCallbacks));

        await act(async () => {
          await result.current.startSession();
        });

        // Toggle on
        await act(async () => {
          await result.current.toggleMic();
        });
        expect(result.current.isMicOn).toBe(true);

        // Toggle off
        await act(async () => {
          await result.current.toggleMic();
        });
        expect(result.current.isMicOn).toBe(false);
      });
    });

    describe('Camera Controls', () => {
      it('should enable camera successfully', async () => {
        const { result } = renderHook(() => useOrgaAI(mockCallbacks));

        await act(async () => {
          await result.current.startSession();
        });

        await act(async () => {
          await result.current.enableCamera();
        });

        expect(result.current.isCameraOn).toBe(true);
        expect(result.current.userVideoStream).not.toBeNull();
        expect(result.current.modalities).toContain('video');
        expect(logger.info).toHaveBeenCalledWith('📹 Enabling camera');
      });

      it('should disable camera with soft disable', async () => {
        const { result } = renderHook(() => useOrgaAI(mockCallbacks));

        await act(async () => {
          await result.current.startSession();
        });

        // Enable first to set the stream
        await act(async () => {
          await result.current.enableCamera();
        });

        // Disable
        await act(async () => {
          await result.current.disableCamera(false);
        });

        expect(result.current.isCameraOn).toBe(false);
        expect(result.current.modalities).not.toContain('video');
        expect(logger.info).toHaveBeenCalledWith('📹 Disabling camera');
      });

      it('should disable camera with hard disable', async () => {
        const { result } = renderHook(() => useOrgaAI(mockCallbacks));

        await act(async () => {
          await result.current.startSession();
        });

        // Enable first
        await act(async () => {
          await result.current.enableCamera();
        });

        // Hard disable
        await act(async () => {
          await result.current.disableCamera(true);
        });

        expect(result.current.isCameraOn).toBe(false);
        expect(result.current.userVideoStream).toBeNull();
        // The track.stop() is called on the tracks from the stream, not the mock directly
        expect(mockTrack.stop).toHaveBeenCalled();
      });

      it('should toggle camera', async () => {
        const { result } = renderHook(() => useOrgaAI(mockCallbacks));

        await act(async () => {
          await result.current.startSession();
        });

        // Toggle on
        await act(async () => {
          await result.current.toggleCamera();
        });
        expect(result.current.isCameraOn).toBe(true);

        // Toggle off
        await act(async () => {
          await result.current.toggleCamera();
        });
        expect(result.current.isCameraOn).toBe(false);
      });

      it('should handle camera enable errors', async () => {
        const cameraError = new Error('Camera error');
        (window.navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(cameraError);

        const { result } = renderHook(() => useOrgaAI(mockCallbacks));

        await act(async () => {
          await result.current.startSession();
        });

        await act(async () => {
          try {
            await result.current.enableCamera();
          } catch (error) {
            expect(error).toBe(cameraError);
          }
        });

        expect(logger.error).toHaveBeenCalledWith('❌ Failed to enable camera:', cameraError);
      });
    });
  });

  describe('Parameter Management', () => {
    it('should update parameters successfully', async () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      await act(async () => {
        result.current.updateParams({
          model: 'orga-1-beta',
          voice: 'Sofía',
          temperature: 0.7,
          instructions: 'New instructions',
          modalities: ['audio', 'video']
        });
      });

      expect(result.current.model).toBe('orga-1-beta');
      expect(result.current.voice).toBe('Sofía');
      expect(result.current.temperature).toBe(0.7);
      expect(result.current.instructions).toBe('New instructions');
      expect(result.current.modalities).toEqual(['audio', 'video']);
      expect(logger.debug).toHaveBeenCalledWith('🔄 Updating parameters:', expect.any(Object));
    });

    it('should send updated params when connected', async () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start session to get connected state
      await act(async () => {
        await result.current.startSession();
      });

      // Update params
      await act(async () => {
        result.current.updateParams({
          model: 'orga-1-beta',
          temperature: 0.8
        });
      });

      // Check that send was called and parse the data
      expect(mockDataChannel.send).toHaveBeenCalled();
      const sentData = JSON.parse(mockDataChannel.send.mock.calls[0][0]);
      expect(sentData.event).toBe(DataChannelEventTypes.SESSION_UPDATE);
      expect(sentData.data).toHaveProperty('model', 'orga-1-beta');
      expect(sentData.data).toHaveProperty('temperature');
    });

    it('should not send updated params when not connected', async () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      await act(async () => {
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
          (mockDataChannel as any).messageCallback = callback;
        }
      });
    });

    it('should handle user speech transcription events', async () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start session to set conversation ID
      await act(async () => {
        await result.current.startSession();
      });

      // Simulate data channel message
      const transcriptionEvent = {
        type: DataChannelEventTypes.USER_SPEECH_TRANSCRIPTION,
        transcript: 'Hello, how are you?'
      };

      await act(async () => {
        (mockDataChannel as any).messageCallback({
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
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start session with config to ensure conversationId and params are set
      await act(async () => {
        await result.current.startSession({
          model: 'orga-1-beta',
          voice: 'Sofía',
        });
      });

      // Simulate data channel message
      const responseEvent = {
        type: DataChannelEventTypes.ASSISTANT_RESPONSE_COMPLETE,
        text: 'I am doing well, thank you!'
      };

      await act(async () => {
        (mockDataChannel as any).messageCallback({
          data: JSON.stringify(responseEvent)
        });
      });

      await waitFor(() => {
        expect(result.current.conversationItems).toHaveLength(1);
      });
      expect(result.current.conversationItems[0]).toMatchObject({
        conversationId: 'conv-123',
        sender: 'assistant',
        content: {
          type: 'text',
          message: 'I am doing well, thank you!'
        },
        timestamp: expect.any(String)
      });
      expect(mockCallbacks.onConversationMessageCreated).toHaveBeenCalled();
    });

    it('should handle data channel message parsing errors', async () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start session
      await act(async () => {
        await result.current.startSession();
      });

      // Simulate invalid JSON
      await act(async () => {
        (mockDataChannel as any).messageCallback({
          data: 'invalid json'
        });
      });

      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        expect.any(Error)
      );
      expect(logger.error).toHaveBeenCalledWith(
        '❌ Error parsing data channel message:',
        expect.any(Error)
      );
    });
  });

  describe('Connection State Management', () => {
    it('should handle connection state changes', async () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start session
      await act(async () => {
        await result.current.startSession();
      });

      // Find the connection state callback
      const connectionStateCallback = mockPeerConnection.addEventListener.mock.calls.find(
        call => call[0] === 'connectionstatechange'
      )?.[1];

      // Mock the event object with proper target
      const mockEvent = {
        target: mockPeerConnection
      };

      await act(async () => {
        connectionStateCallback(mockEvent);
      });

      expect(mockCallbacks.onConnectionStateChange).toHaveBeenCalledWith('connected');
    });

    it('should handle connection failure', async () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start session
      await act(async () => {
        await result.current.startSession();
      });

      // Find the connection state callback
      const connectionStateCallback = mockPeerConnection.addEventListener.mock.calls.find(
        call => call[0] === 'connectionstatechange'
      )?.[1];

      // Mock the event object with failed state
      const mockEvent = {
        target: {
          ...mockPeerConnection,
          connectionState: 'failed'
        }
      };

      await act(async () => {
        connectionStateCallback(mockEvent);
      });

      // The cleanup should be called, which sets state to closed
      expect(result.current.connectionState).toBe('closed');
      expect(logger.warn).toHaveBeenCalledWith('⚠️ Connection lost, cleaning up...');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on unmount', async () => {
      const { result, unmount } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start session to create resources
      await act(async () => {
        await result.current.startSession();
      });

      // Unmount to trigger cleanup
      unmount();

      // The cleanup should be called, but it might not be immediate
      await waitFor(() => {
        expect(mockPeerConnection.close).toHaveBeenCalled();
        // The data channel close might not be called immediately due to async cleanup
        expect(logger.info).toHaveBeenCalledWith('🧹 Cleaning up resources');
      });
    });

    it('should handle cleanup errors gracefully', async () => {
      mockPeerConnection.close.mockImplementation(() => {
        throw new Error('Cleanup error');
      });

      const { result, unmount } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start session to create resources
      await act(async () => {
        await result.current.startSession();
      });

      // Unmount to trigger cleanup
      unmount();

      // The cleanup error should be logged
      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith('❌ Error closing peer connection', expect.any(Error));
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      (connectToRealtime as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      await act(async () => {
        try {
          await result.current.startSession();
        } catch (error) {
          expect(error).toBeInstanceOf(ConnectionError);
        }
      });

      expect(result.current.connectionState).toBe('closed');
      expect(mockCallbacks.onError).toHaveBeenCalled();
    });

    it('should handle network errors with improved messages', async () => {
      (connectToRealtime as jest.Mock).mockRejectedValue(new Error('fetch'));

      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      await act(async () => {
        try {
          await result.current.startSession();
        } catch (error) {
          expect(error).toBeInstanceOf(ConnectionError);
        }
      });

      expect(logger.error).toHaveBeenCalledWith(
        '❌',
        expect.stringContaining('Network error'),
        expect.any(Error)
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle full session lifecycle', async () => {
      const { result } = renderHook(() => useOrgaAI(mockCallbacks));

      // Start session
      await act(async () => {
        await result.current.startSession();
      });
      expect(result.current.connectionState).toBe('connected');

      // Enable media
      await act(async () => {
        await result.current.enableMic();
        await result.current.enableCamera();
      });
      expect(result.current.isMicOn).toBe(true);
      expect(result.current.isCameraOn).toBe(true);

      // Update parameters
      await act(async () => {
        result.current.updateParams({
          temperature: 0.8,
          instructions: 'Be more helpful'
        });
      });
      expect(result.current.temperature).toBe(0.8);

      // End session
      await act(async () => {
        await result.current.endSession();
      });
      expect(result.current.connectionState).toBe('closed');
      expect(result.current.isMicOn).toBe(false);
      expect(result.current.isCameraOn).toBe(false);
    });
  });
});
