// React Native specific setup - no DOM dependencies
export {}


// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  View: ({ testID, children, ...props }: any) => {
    const React = require('react');
    return React.createElement('View', { testID, ...props }, children);
  },
  Text: ({ testID, children, ...props }: any) => {
    const React = require('react');
    return React.createElement('Text', { testID, ...props }, children);
  },
  TouchableOpacity: ({ testID, children, onPress, ...props }: any) => {
    const React = require('react');
    return React.createElement('TouchableOpacity', { testID, onPress, ...props }, children);
  },
  ActivityIndicator: ({ testID, ...props }: any) => {
    const React = require('react');
    return React.createElement('ActivityIndicator', { testID, ...props });
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
  NativeModules: {
    InCallManager: {
      start: jest.fn(),
      stop: jest.fn(),
      turnScreenOff: jest.fn(),
      turnScreenOn: jest.fn(),
      setForceSpeakerphoneOn: jest.fn(),
      setSpeakerphoneOn: jest.fn(),
    },
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
}));

// Create a mock MediaStream class first
class MockMediaStream {
  tracks: any[];
  
  constructor(tracks: any[] = []) {
    this.tracks = tracks;
  }
  
  getTracks() {
    return this.tracks;
  }
  
  getVideoTracks() {
    return this.tracks.filter(track => track.kind === 'video');
  }
  
  getAudioTracks() {
    return this.tracks.filter(track => track.kind === 'audio');
  }
}

// Create a mock RTCPeerConnection class
class MockRTCPeerConnection {
  localDescription: any;
  remoteDescription: any;
  iceConnectionState: string;
  connectionState: string;
  signalingState: string;
  
  constructor() {
    this.localDescription = null;
    this.remoteDescription = null;
    this.iceConnectionState = 'new';
    this.connectionState = 'new';
    this.signalingState = 'stable';
  }
  
  createOffer() {
    return Promise.resolve({ type: 'offer', sdp: 'mock-sdp' });
  }
  
  createAnswer() {
    return Promise.resolve({ type: 'answer', sdp: 'mock-sdp' });
  }
  
  setLocalDescription(description: any) {
    this.localDescription = description;
    return Promise.resolve();
  }
  
  setRemoteDescription(description: any) {
    this.remoteDescription = description;
    return Promise.resolve();
  }
  
  addTrack(track: any, stream: any) {
    return { id: 'mock-sender-id' };
  }
  
  removeTrack(sender: any) {
    return Promise.resolve();
  }
  
  close() {
    this.iceConnectionState = 'closed';
    this.connectionState = 'closed';
  }
}

// Mock react-native-webrtc
jest.mock('react-native-webrtc', () => ({
  RTCPeerConnection: MockRTCPeerConnection,
  RTCView: ({ testID, ...props }: any) => {
    const React = require('react');
    return React.createElement('RTCView', { testID, ...props });
  },
  MediaStream: MockMediaStream,
  mediaDevices: {
    getUserMedia: jest.fn(() => Promise.resolve(new MockMediaStream())),
  },
}));

// Mock react-native-incall-manager
jest.mock('react-native-incall-manager', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  turnScreenOff: jest.fn(),
  turnScreenOn: jest.fn(),
  setForceSpeakerphoneOn: jest.fn(),
  setSpeakerphoneOn: jest.fn(),
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

// Mock fetch globally
(globalThis as any).fetch = jest.fn();

// Mock global OrgaAI
(globalThis as any).OrgaAI = undefined;