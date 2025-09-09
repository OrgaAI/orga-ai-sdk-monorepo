"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const OrgaVideo_1 = require("../../components/OrgaVideo");
// Mock the utils module
jest.mock('../../utils', () => ({
    logger: {
        debug: jest.fn()
    }
}));
describe('OrgaVideo', () => {
    const mockStream = new MediaStream();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Basic Rendering', () => {
        it('should render video element with default props', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, "data-testid": "video-element" }));
            const videoElement = react_2.screen.getByTestId('video-element');
            expect(videoElement).toBeInTheDocument();
            expect(videoElement).toHaveAttribute('playsInline');
            expect(videoElement).toHaveAttribute('autoPlay');
        });
        it('should render video element with custom props', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, hidden: false, className: "custom-video", "data-testid": "custom-video" }));
            const videoElement = react_2.screen.getByTestId('custom-video');
            expect(videoElement).toBeInTheDocument();
            expect(videoElement).toHaveClass('custom-video');
            expect(videoElement).not.toHaveAttribute('hidden');
        });
        it('should render with null stream', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: null, "data-testid": "video-element" }));
            const videoElement = react_2.screen.getByTestId('video-element');
            expect(videoElement).toBeInTheDocument();
        });
    });
    describe('Props Handling', () => {
        it('should pass through all HTML video attributes', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, id: "test-video", className: "test-class", style: { color: 'red' }, "data-custom": "test", "aria-label": "Test video", "data-testid": "video-element" }));
            const videoElement = react_2.screen.getByTestId('video-element');
            expect(videoElement).toHaveAttribute('id', 'test-video');
            expect(videoElement).toHaveClass('test-class');
            expect(videoElement).toHaveStyle({ color: 'red' });
            expect(videoElement).toHaveAttribute('data-custom', 'test');
            expect(videoElement).toHaveAttribute('aria-label', 'Test video');
        });
        it('should override default props when custom props are provided', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, hidden: false, autoPlay: false, playsInline: false, muted: true, controls: true, "data-testid": "video-element" }));
            const videoElement = react_2.screen.getByTestId('video-element');
            expect(videoElement).not.toHaveAttribute('hidden');
            expect(videoElement).not.toHaveAttribute('autoPlay');
            expect(videoElement).not.toHaveAttribute('playsInline');
            expect(videoElement.muted).toBe(true);
            expect(videoElement).toHaveAttribute('controls');
        });
        it('should maintain default autoPlay and playsInline attributes', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, "data-testid": "video-element" }));
            const videoElement = react_2.screen.getByTestId('video-element');
            expect(videoElement).toHaveAttribute('autoPlay');
            expect(videoElement).toHaveAttribute('playsInline');
        });
        it('should handle video-specific attributes', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, poster: "test-poster.jpg", preload: "metadata", width: 640, height: 480, "data-testid": "video-element" }));
            const videoElement = react_2.screen.getByTestId('video-element');
            expect(videoElement).toHaveAttribute('poster', 'test-poster.jpg');
            expect(videoElement).toHaveAttribute('preload', 'metadata');
            expect(videoElement).toHaveAttribute('width', '640');
            expect(videoElement).toHaveAttribute('height', '480');
        });
        it('should maintain playsInline for mobile compatibility', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, "data-testid": "video-element" }));
            const videoElement = react_2.screen.getByTestId('video-element');
            expect(videoElement).toHaveAttribute('playsInline');
        });
        it('should allow playsInline to be overridden', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, playsInline: false, "data-testid": "video-element" }));
            const videoElement = react_2.screen.getByTestId('video-element');
            expect(videoElement).not.toHaveAttribute('playsInline');
        });
        it('should pass stream to video element', () => {
            const mockStream = new MediaStream();
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, "data-testid": "video" }));
            expect(react_2.screen.getByTestId('video')).toBeInTheDocument();
        });
    });
    describe('Video Element Properties', () => {
        it('should have video element properties', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, "data-testid": "video-element" }));
            const videoElement = react_2.screen.getByTestId('video-element');
            expect(videoElement).toHaveProperty('videoWidth');
            expect(videoElement).toHaveProperty('videoHeight');
            expect(videoElement).toHaveProperty('readyState');
        });
    });
    describe('Accessibility', () => {
        it('should have proper ARIA attributes when provided', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, "aria-label": "Voice conversation video", "aria-describedby": "video-description", "data-testid": "video-element" }));
            const videoElement = react_2.screen.getByTestId('video-element');
            expect(videoElement).toHaveAttribute('aria-label', 'Voice conversation video');
            expect(videoElement).toHaveAttribute('aria-describedby', 'video-description');
        });
        it('should be playsInline by default for screen readers', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, "data-testid": "video-element" }));
            const videoElement = react_2.screen.getByTestId('video-element');
            expect(videoElement).toHaveAttribute('playsInline');
        });
    });
    describe('Logging', () => {
        it('should log debug message when stream changes', () => {
            const mockLogger = require('../../utils').logger;
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, "data-testid": "video-element" }));
            expect(mockLogger.debug).toHaveBeenCalledWith('OrgaVideo stream:', mockStream);
        });
        it('should log debug message when stream is null', () => {
            const mockLogger = require('../../utils').logger;
            (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: null, "data-testid": "video-element" }));
            expect(mockLogger.debug).toHaveBeenCalledWith('OrgaVideo stream:', null);
        });
    });
    describe('Component Structure', () => {
        it('should return a single video element', () => {
            const { container } = (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, "data-testid": "video-element" }));
            expect(container.children).toHaveLength(1);
            expect(container.firstChild).toBeInstanceOf(HTMLVideoElement);
        });
        it('should not render any additional elements', () => {
            const { container } = (0, react_2.render)(react_1.default.createElement(OrgaVideo_1.OrgaVideo, { stream: mockStream, "data-testid": "video-element" }));
            const videoElement = container.querySelector('video');
            expect(videoElement).toBeInTheDocument();
            expect(container.children).toHaveLength(1);
        });
    });
});
