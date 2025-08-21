import React from 'react';
import { render, screen } from '@testing-library/react';
import { OrgaVideo } from '../../components/OrgaVideo';

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
      render(<OrgaVideo stream={mockStream} data-testid="video-element" />);
      
      const videoElement = screen.getByTestId('video-element');
      expect(videoElement).toBeInTheDocument();
      expect(videoElement).toHaveAttribute('playsInline');
      expect(videoElement).toHaveAttribute('autoPlay');
    });

    it('should render video element with custom props', () => {
      render(
        <OrgaVideo 
          stream={mockStream} 
          hidden={false}
          className="custom-video"
          data-testid="custom-video"
        />
      );
      
      const videoElement = screen.getByTestId('custom-video');
      expect(videoElement).toBeInTheDocument();
      expect(videoElement).toHaveClass('custom-video');
      expect(videoElement).not.toHaveAttribute('hidden');
    });

    it('should render with null stream', () => {
      render(<OrgaVideo stream={null} data-testid="video-element" />);
      
      const videoElement = screen.getByTestId('video-element');
      expect(videoElement).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should pass through all HTML video attributes', () => {
      render(
        <OrgaVideo 
          stream={mockStream}
          id="test-video"
          className="test-class"
          style={{ color: 'red' }}
          data-custom="test"
          aria-label="Test video"
          data-testid="video-element"
        />
      );
      
      const videoElement = screen.getByTestId('video-element');
      expect(videoElement).toHaveAttribute('id', 'test-video');
      expect(videoElement).toHaveClass('test-class');
      expect(videoElement).toHaveStyle({ color: 'red' });
      expect(videoElement).toHaveAttribute('data-custom', 'test');
      expect(videoElement).toHaveAttribute('aria-label', 'Test video');
    });

    it('should override default props when custom props are provided', () => {
      render(
        <OrgaVideo 
          stream={mockStream}
          hidden={false}
          autoPlay={false}
          playsInline={false}
          muted={true}
          controls={true}
          data-testid="video-element"
        />
      );
      
      const videoElement = screen.getByTestId('video-element') as HTMLVideoElement;
      expect(videoElement).not.toHaveAttribute('hidden');
      expect(videoElement).not.toHaveAttribute('autoPlay');
      expect(videoElement).not.toHaveAttribute('playsInline');
      expect(videoElement.muted).toBe(true);
      expect(videoElement).toHaveAttribute('controls');
    });

    it('should maintain default autoPlay and playsInline attributes', () => {
      render(<OrgaVideo stream={mockStream} data-testid="video-element" />);
      
      const videoElement = screen.getByTestId('video-element');
      expect(videoElement).toHaveAttribute('autoPlay');
      expect(videoElement).toHaveAttribute('playsInline');
    });

    it('should handle video-specific attributes', () => {
      render(
        <OrgaVideo 
          stream={mockStream}
          poster="test-poster.jpg"
          preload="metadata"
          width={640}
          height={480}
          data-testid="video-element"
        />
      );
      
      const videoElement = screen.getByTestId('video-element') as HTMLVideoElement;
      expect(videoElement).toHaveAttribute('poster', 'test-poster.jpg');
      expect(videoElement).toHaveAttribute('preload', 'metadata');
      expect(videoElement).toHaveAttribute('width', '640');
      expect(videoElement).toHaveAttribute('height', '480');
    });

    it('should maintain playsInline for mobile compatibility', () => {
      render(<OrgaVideo stream={mockStream} data-testid="video-element" />);
      
      const videoElement = screen.getByTestId('video-element');
      expect(videoElement).toHaveAttribute('playsInline');
    });

    it('should allow playsInline to be overridden', () => {
      render(
        <OrgaVideo 
          stream={mockStream} 
          playsInline={false}
          data-testid="video-element" 
        />
      );
      
      const videoElement = screen.getByTestId('video-element');
      expect(videoElement).not.toHaveAttribute('playsInline');
    });

    it('should pass stream to video element', () => {
        const mockStream = new MediaStream();
        render(<OrgaVideo stream={mockStream} data-testid="video" />);
        
        expect(screen.getByTestId('video')).toBeInTheDocument();
      });
  });

  describe('Video Element Properties', () => {
    it('should have video element properties', () => {
      render(<OrgaVideo stream={mockStream} data-testid="video-element" />);
      
      const videoElement = screen.getByTestId('video-element') as HTMLVideoElement;
      expect(videoElement).toHaveProperty('videoWidth');
      expect(videoElement).toHaveProperty('videoHeight');
      expect(videoElement).toHaveProperty('readyState');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when provided', () => {
      render(
        <OrgaVideo 
          stream={mockStream}
          aria-label="Voice conversation video"
          aria-describedby="video-description"
          data-testid="video-element"
        />
      );
      
      const videoElement = screen.getByTestId('video-element');
      expect(videoElement).toHaveAttribute('aria-label', 'Voice conversation video');
      expect(videoElement).toHaveAttribute('aria-describedby', 'video-description');
    });

    it('should be playsInline by default for screen readers', () => {
      render(<OrgaVideo stream={mockStream} data-testid="video-element" />);
      
      const videoElement = screen.getByTestId('video-element');
      expect(videoElement).toHaveAttribute('playsInline');
    });
  });

  describe('Logging', () => {
    it('should log debug message when stream changes', () => {
      const mockLogger = require('../../utils').logger;
      
      render(<OrgaVideo stream={mockStream} data-testid="video-element" />);
      
      expect(mockLogger.debug).toHaveBeenCalledWith('OrgaVideo stream:', mockStream);
    });

    it('should log debug message when stream is null', () => {
      const mockLogger = require('../../utils').logger;
      
      render(<OrgaVideo stream={null} data-testid="video-element" />);
      
      expect(mockLogger.debug).toHaveBeenCalledWith('OrgaVideo stream:', null);
    });
  });

  describe('Component Structure', () => {
    it('should return a single video element', () => {
      const { container } = render(<OrgaVideo stream={mockStream} data-testid="video-element" />);
      
      expect(container.children).toHaveLength(1);
      expect(container.firstChild).toBeInstanceOf(HTMLVideoElement);
    });

    it('should not render any additional elements', () => {
      const { container } = render(<OrgaVideo stream={mockStream} data-testid="video-element" />);
      
      const videoElement = container.querySelector('video');
      expect(videoElement).toBeInTheDocument();
      expect(container.children).toHaveLength(1);
    });
  });
});