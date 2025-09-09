"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const OrgaAudio_1 = require("../../components/OrgaAudio");
// Mock the utils module
jest.mock('../../utils', () => ({
    logger: {
        debug: jest.fn()
    }
}));
describe('OrgaAudio', () => {
    const mockStream = new MediaStream();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Basic Rendering', () => {
        it('should render audio element with default props', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: mockStream, "data-testid": "audio-element" }));
            const audioElement = react_2.screen.getByTestId('audio-element');
            expect(audioElement).toBeInTheDocument();
            expect(audioElement).toHaveAttribute('hidden');
            expect(audioElement).toHaveAttribute('autoPlay');
        });
        it('should render audio element with custom props', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: mockStream, hidden: false, className: "custom-audio", "data-testid": "custom-audio" }));
            const audioElement = react_2.screen.getByTestId('custom-audio');
            expect(audioElement).toBeInTheDocument();
            expect(audioElement).toHaveClass('custom-audio');
            expect(audioElement).not.toHaveAttribute('hidden');
        });
        it('should render with null stream', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: null, "data-testid": "audio-element" }));
            const audioElement = react_2.screen.getByTestId('audio-element');
            expect(audioElement).toBeInTheDocument();
        });
    });
    describe('Props Handling', () => {
        it('should pass through all HTML audio attributes', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: mockStream, id: "test-audio", className: "test-class", style: { color: 'red' }, "data-custom": "test", "aria-label": "Test audio", "data-testid": "audio-element" }));
            const audioElement = react_2.screen.getByTestId('audio-element');
            expect(audioElement).toHaveAttribute('id', 'test-audio');
            expect(audioElement).toHaveClass('test-class');
            expect(audioElement).toHaveStyle({ color: 'red' });
            expect(audioElement).toHaveAttribute('data-custom', 'test');
            expect(audioElement).toHaveAttribute('aria-label', 'Test audio');
        });
        it('should override default props when custom props are provided', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: mockStream, hidden: false, autoPlay: false, muted: true, controls: true, "data-testid": "audio-element" }));
            const audioElement = react_2.screen.getByTestId('audio-element');
            expect(audioElement).not.toHaveAttribute('hidden');
            expect(audioElement).not.toHaveAttribute('autoPlay');
            expect(audioElement.muted).toBe(true);
            expect(audioElement).toHaveAttribute('controls');
        });
        it('should maintain default autoPlay and hidden attributes', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: mockStream, "data-testid": "audio-element" }));
            const audioElement = react_2.screen.getByTestId('audio-element');
            expect(audioElement).toHaveAttribute('autoPlay');
            expect(audioElement).toHaveAttribute('hidden');
        });
    });
    describe('Accessibility', () => {
        it('should have proper ARIA attributes when provided', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: mockStream, "aria-label": "Voice conversation audio", "aria-describedby": "audio-description", "data-testid": "audio-element" }));
            const audioElement = react_2.screen.getByTestId('audio-element');
            expect(audioElement).toHaveAttribute('aria-label', 'Voice conversation audio');
            expect(audioElement).toHaveAttribute('aria-describedby', 'audio-description');
        });
        it('should be hidden by default for screen readers', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: mockStream, "data-testid": "audio-element" }));
            const audioElement = react_2.screen.getByTestId('audio-element');
            expect(audioElement).toHaveAttribute('hidden');
        });
        it('should be visible when hidden prop is false', () => {
            (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: mockStream, hidden: false, "data-testid": "audio-element" }));
            const audioElement = react_2.screen.getByTestId('audio-element');
            expect(audioElement).not.toHaveAttribute('hidden');
        });
    });
    describe('Logging', () => {
        it('should log debug message when stream changes', () => {
            const mockLogger = require('../../utils').logger;
            (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: mockStream, "data-testid": "audio-element" }));
            expect(mockLogger.debug).toHaveBeenCalledWith('OrgaAudio stream:', mockStream);
        });
        it('should log debug message when stream is null', () => {
            const mockLogger = require('../../utils').logger;
            (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: null, "data-testid": "audio-element" }));
            expect(mockLogger.debug).toHaveBeenCalledWith('OrgaAudio stream:', null);
        });
    });
    describe('Component Structure', () => {
        it('should return a single audio element', () => {
            const { container } = (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: mockStream, "data-testid": "audio-element" }));
            expect(container.children).toHaveLength(1);
            expect(container.firstChild).toBeInstanceOf(HTMLAudioElement);
        });
        it('should not render any additional elements', () => {
            const { container } = (0, react_2.render)(react_1.default.createElement(OrgaAudio_1.OrgaAudio, { stream: mockStream, "data-testid": "audio-element" }));
            const audioElement = container.querySelector('audio');
            expect(audioElement).toBeInTheDocument();
            expect(container.children).toHaveLength(1);
        });
    });
});
