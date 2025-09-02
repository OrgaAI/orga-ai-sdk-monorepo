"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
// Mock global objects that might not be available in jsdom
global.MediaStream = class MockMediaStream {
    constructor(tracks = []) {
        this.tracks = tracks;
    }
    getTracks() {
        return this.tracks;
    }
    addTrack(track) {
        this.tracks.push(track);
    }
    removeTrack(track) {
        const index = this.tracks.indexOf(track);
        if (index > -1) {
            this.tracks.splice(index, 1);
        }
    }
};
// Mock RTCPeerConnection
global.RTCPeerConnection = class MockRTCPeerConnection {
    constructor(configuration) {
        this.connectionState = 'new';
        this.onconnectionstatechange = null;
        // Mock implementation
    }
    createOffer() {
        return Promise.resolve({ type: 'offer', sdp: 'mock-sdp' });
    }
    createAnswer() {
        return Promise.resolve({ type: 'answer', sdp: 'mock-sdp' });
    }
    setLocalDescription(description) {
        return Promise.resolve();
    }
    setRemoteDescription(description) {
        return Promise.resolve();
    }
    addIceCandidate(candidate) {
        return Promise.resolve();
    }
    close() {
        this.connectionState = 'closed';
    }
};
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
