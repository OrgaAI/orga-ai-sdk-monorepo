import '@testing-library/jest-dom';

// Mock global objects that might not be available in jsdom
global.MediaStream = class MockMediaStream {
  constructor(tracks: MediaStreamTrack[] = []) {
    this.tracks = tracks;
  }
  tracks: MediaStreamTrack[];
  getTracks(): MediaStreamTrack[] {
    return this.tracks;
  }
  addTrack(track: MediaStreamTrack): void {
    this.tracks.push(track);
  }
  removeTrack(track: MediaStreamTrack): void {
    const index = this.tracks.indexOf(track);
    if (index > -1) {
      this.tracks.splice(index, 1);
    }
  }
} as any;

// Mock RTCPeerConnection
global.RTCPeerConnection = class MockRTCPeerConnection {
  connectionState: RTCPeerConnection['connectionState'] = 'new';
  onconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null = null;
  
  constructor(configuration?: RTCConfiguration) {
    // Mock implementation
  }
  
  createOffer(): Promise<RTCSessionDescriptionInit> {
    return Promise.resolve({ type: 'offer', sdp: 'mock-sdp' } as RTCSessionDescriptionInit);
  }
  
  createAnswer(): Promise<RTCSessionDescriptionInit> {
    return Promise.resolve({ type: 'answer', sdp: 'mock-sdp' } as RTCSessionDescriptionInit);
  }
  
  setLocalDescription(description: RTCSessionDescriptionInit): Promise<void> {
    return Promise.resolve();
  }
  
  setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    return Promise.resolve();
  }
  
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    return Promise.resolve();
  }
  
  close(): void {
    this.connectionState = 'closed';
  }
} as any;

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue(new MediaStream()),
    enumerateDevices: jest.fn().mockResolvedValue([]),
  },
  writable: true,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
