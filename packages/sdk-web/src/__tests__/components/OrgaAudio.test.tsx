import React from 'react';
import { render, screen } from '@testing-library/react';
import { OrgaAudio } from '../../components/OrgaAudio';

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
      render(<OrgaAudio stream={mockStream} data-testid="audio-element" />);
      
      const audioElement = screen.getByTestId('audio-element');
      expect(audioElement).toBeInTheDocument();
      expect(audioElement).toHaveAttribute('hidden');
      expect(audioElement).toHaveAttribute('autoPlay');
    });

    it('should render audio element with custom props', () => {
      render(
        <OrgaAudio 
          stream={mockStream} 
          hidden={false}
          className="custom-audio"
          data-testid="custom-audio"
        />
      );
      
      const audioElement = screen.getByTestId('custom-audio');
      expect(audioElement).toBeInTheDocument();
      expect(audioElement).toHaveClass('custom-audio');
      expect(audioElement).not.toHaveAttribute('hidden');
    });

    it('should render with null stream', () => {
      render(<OrgaAudio stream={null} data-testid="audio-element" />);
      
      const audioElement = screen.getByTestId('audio-element');
      expect(audioElement).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should pass through all HTML audio attributes', () => {
      render(
        <OrgaAudio 
          stream={mockStream}
          id="test-audio"
          className="test-class"
          style={{ color: 'red' }}
          data-custom="test"
          aria-label="Test audio"
          data-testid="audio-element"
        />
      );
      
      const audioElement = screen.getByTestId('audio-element');
      expect(audioElement).toHaveAttribute('id', 'test-audio');
      expect(audioElement).toHaveClass('test-class');
      expect(audioElement).toHaveStyle({ color: 'red' });
      expect(audioElement).toHaveAttribute('data-custom', 'test');
      expect(audioElement).toHaveAttribute('aria-label', 'Test audio');
    });

    it('should override default props when custom props are provided', () => {
      render(
        <OrgaAudio 
          stream={mockStream}
          hidden={false}
          autoPlay={false}
          muted={true}
          controls={true}
          data-testid="audio-element"
        />
      );
      
      const audioElement = screen.getByTestId('audio-element') as HTMLAudioElement;
      expect(audioElement).not.toHaveAttribute('hidden');
      expect(audioElement).not.toHaveAttribute('autoPlay');
      expect(audioElement.muted).toBe(true);
      expect(audioElement).toHaveAttribute('controls');
    });

    it('should maintain default autoPlay and hidden attributes', () => {
      render(<OrgaAudio stream={mockStream} data-testid="audio-element" />);
      
      const audioElement = screen.getByTestId('audio-element');
      expect(audioElement).toHaveAttribute('autoPlay');
      expect(audioElement).toHaveAttribute('hidden');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when provided', () => {
      render(
        <OrgaAudio 
          stream={mockStream}
          aria-label="Voice conversation audio"
          aria-describedby="audio-description"
          data-testid="audio-element"
        />
      );
      
      const audioElement = screen.getByTestId('audio-element');
      expect(audioElement).toHaveAttribute('aria-label', 'Voice conversation audio');
      expect(audioElement).toHaveAttribute('aria-describedby', 'audio-description');
    });

    it('should be hidden by default for screen readers', () => {
      render(<OrgaAudio stream={mockStream} data-testid="audio-element" />);
      
      const audioElement = screen.getByTestId('audio-element');
      expect(audioElement).toHaveAttribute('hidden');
    });

    it('should be visible when hidden prop is false', () => {
      render(<OrgaAudio stream={mockStream} hidden={false} data-testid="audio-element" />);
      
      const audioElement = screen.getByTestId('audio-element');
      expect(audioElement).not.toHaveAttribute('hidden');
    });
  });

  describe('Logging', () => {
    it('should log debug message when stream changes', () => {
      const mockLogger = require('../../utils').logger;
      
      render(<OrgaAudio stream={mockStream} data-testid="audio-element" />);
      
      expect(mockLogger.debug).toHaveBeenCalledWith('OrgaAudio stream:', mockStream);
    });

    it('should log debug message when stream is null', () => {
      const mockLogger = require('../../utils').logger;
      
      render(<OrgaAudio stream={null} data-testid="audio-element" />);
      
      expect(mockLogger.debug).toHaveBeenCalledWith('OrgaAudio stream:', null);
    });
  });

  describe('Component Structure', () => {
    it('should return a single audio element', () => {
      const { container } = render(<OrgaAudio stream={mockStream} data-testid="audio-element" />);
      
      expect(container.children).toHaveLength(1);
      expect(container.firstChild).toBeInstanceOf(HTMLAudioElement);
    });

    it('should not render any additional elements', () => {
      const { container } = render(<OrgaAudio stream={mockStream} data-testid="audio-element" />);
      
      const audioElement = container.querySelector('audio');
      expect(audioElement).toBeInTheDocument();
      expect(container.children).toHaveLength(1);
    });
  });
});