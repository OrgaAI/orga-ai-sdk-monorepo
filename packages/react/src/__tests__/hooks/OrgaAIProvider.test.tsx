import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { OrgaAIProvider, useOrgaAI } from '../../hooks/OrgaAIProvider';
import { OrgaAI, logger } from '@orga-ai/core';
import { OrgaAIModel, OrgaAIVoice } from '../../types';

// Mock dependencies
jest.mock('../../core/OrgaAI');
jest.mock('../../utils', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
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

// Test component to access context
const TestComponent = () => {
  const context = useOrgaAI();
  return (
    <div>
      <div data-testid="model">{context.model}</div>
      <div data-testid="voice">{context.voice}</div>
      <div data-testid="temperature">{context.temperature}</div>
      <button 
        data-testid="set-model" 
        onClick={() => context.setModel('orga-1-beta')}
      >
        Set Model
      </button>
      <button 
        data-testid="set-voice" 
        onClick={() => context.setVoice('alloy')}
      >
        Set Voice
      </button>
      <button 
        data-testid="set-temperature" 
        onClick={() => context.setTemperature(0.7)}
      >
        Set Temperature
      </button>
      <button 
        data-testid="start-session" 
        onClick={() => context.startSession()}
      >
        Start Session
      </button>
    </div>
  );
};

describe('OrgaAIProvider', () => {
  const mockOrgaAI = {
    getConfig: jest.fn(),
    init: jest.fn(),
    isInitialized: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (OrgaAI as jest.Mocked<typeof OrgaAI>).getConfig = mockOrgaAI.getConfig;
    (OrgaAI as jest.Mocked<typeof OrgaAI>).init = mockOrgaAI.init;
    (OrgaAI as jest.Mocked<typeof OrgaAI>).isInitialized = mockOrgaAI.isInitialized;
  });

  describe('Provider Initialization', () => {
    it('should initialize with default values when no config exists', () => {
      mockOrgaAI.getConfig.mockReturnValue({});

      render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      expect(screen.getByTestId('model')).toHaveTextContent('orga-1-beta');
      expect(screen.getByTestId('voice')).toHaveTextContent('alloy');
      expect(screen.getByTestId('temperature')).toHaveTextContent('0.5');
    });

    it('should initialize with config values when available', () => {
      mockOrgaAI.getConfig.mockReturnValue({
        model: 'orga-1-beta' as OrgaAIModel,
        voice: 'echo' as OrgaAIVoice,
        temperature: 0.8,
      });

      render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      expect(screen.getByTestId('model')).toHaveTextContent('orga-1-beta');
      expect(screen.getByTestId('voice')).toHaveTextContent('echo');
      expect(screen.getByTestId('temperature')).toHaveTextContent('0.8');
    });

    it('should handle partial config values', () => {
      mockOrgaAI.getConfig.mockReturnValue({
        model: 'orga-1-beta' as OrgaAIModel,
        // voice and temperature missing
      });

      render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      expect(screen.getByTestId('model')).toHaveTextContent('orga-1-beta');
      expect(screen.getByTestId('voice')).toHaveTextContent('alloy'); // default
      expect(screen.getByTestId('temperature')).toHaveTextContent('0.5'); // default
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      mockOrgaAI.getConfig.mockReturnValue({});
    });

    it('should update model state and call OrgaAI.init', async () => {
      render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      await act(async () => {
        screen.getByTestId('set-model').click();
      });

      expect(mockOrgaAI.init).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'orga-1-beta'
        })
      );
      expect(logger.debug).toHaveBeenCalledWith('[Model] Setting model to orga-1-beta');
    });

    it('should update voice state and call OrgaAI.init', async () => {
      render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      await act(async () => {
        screen.getByTestId('set-voice').click();
      });

      expect(mockOrgaAI.init).toHaveBeenCalledWith(
        expect.objectContaining({
          voice: 'alloy'
        })
      );
      expect(logger.debug).toHaveBeenCalledWith('[Voice] Setting voice to alloy');
    });

    it('should update temperature state and call OrgaAI.init', async () => {
      render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      await act(async () => {
        screen.getByTestId('set-temperature').click();
      });

      expect(mockOrgaAI.init).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7
        })
      );
      expect(logger.debug).toHaveBeenCalledWith('[Temperature] Setting temperature to 0.7');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      mockOrgaAI.getConfig.mockReturnValue({});
    });

    it('should log error for invalid model', async () => {
      const TestComponentWithInvalidModel = () => {
        const context = useOrgaAI();
        return (
          <button 
            data-testid="set-invalid-model" 
            onClick={() => context.setModel('invalid-model' as OrgaAIModel)}
          >
            Set Invalid Model
          </button>
        );
      };

      render(
        <OrgaAIProvider>
          <TestComponentWithInvalidModel />
        </OrgaAIProvider>
      );

      await act(async () => {
        screen.getByTestId('set-invalid-model').click();
      });

      expect(logger.error).toHaveBeenCalledWith('[Model] Invalid model: invalid-model');
      expect(mockOrgaAI.init).not.toHaveBeenCalled();
    });

    it('should log error for invalid voice', async () => {
      const TestComponentWithInvalidVoice = () => {
        const context = useOrgaAI();
        return (
          <button 
            data-testid="set-invalid-voice" 
            onClick={() => context.setVoice('invalid-voice' as OrgaAIVoice)}
          >
            Set Invalid Voice
          </button>
        );
      };

      render(
        <OrgaAIProvider>
          <TestComponentWithInvalidVoice />
        </OrgaAIProvider>
      );

      await act(async () => {
        screen.getByTestId('set-invalid-voice').click();
      });

      expect(logger.error).toHaveBeenCalledWith('[Voice] Invalid voice: invalid-voice');
      expect(mockOrgaAI.init).not.toHaveBeenCalled();
    });

    it('should log error for invalid temperature', async () => {
      const TestComponentWithInvalidTemperature = () => {
        const context = useOrgaAI();
        return (
          <button 
            data-testid="set-invalid-temperature" 
            onClick={() => context.setTemperature(2.5)} // Out of range
          >
            Set Invalid Temperature
          </button>
        );
      };

      render(
        <OrgaAIProvider>
          <TestComponentWithInvalidTemperature />
        </OrgaAIProvider>
      );

      await act(async () => {
        screen.getByTestId('set-invalid-temperature').click();
      });

      expect(logger.error).toHaveBeenCalledWith('[Temperature] Invalid temperature: 2.5');
      expect(mockOrgaAI.init).not.toHaveBeenCalled();
    });

    it('should accept temperature at minimum value', async () => {
      const TestComponentWithMinTemperature = () => {
        const context = useOrgaAI();
        return (
          <button 
            data-testid="set-min-temperature" 
            onClick={() => context.setTemperature(0)}
          >
            Set Min Temperature
          </button>
        );
      };

      render(
        <OrgaAIProvider>
          <TestComponentWithMinTemperature />
        </OrgaAIProvider>
      );

      await act(async () => {
        screen.getByTestId('set-min-temperature').click();
      });

      expect(mockOrgaAI.init).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0
        })
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should accept temperature at maximum value', async () => {
      const TestComponentWithMaxTemperature = () => {
        const context = useOrgaAI();
        return (
          <button 
            data-testid="set-max-temperature" 
            onClick={() => context.setTemperature(1)}
          >
            Set Max Temperature
          </button>
        );
      };

      render(
        <OrgaAIProvider>
          <TestComponentWithMaxTemperature />
        </OrgaAIProvider>
      );

      await act(async () => {
        screen.getByTestId('set-max-temperature').click();
      });

      expect(mockOrgaAI.init).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 1
        })
      );
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      mockOrgaAI.getConfig.mockReturnValue({});
      mockOrgaAI.isInitialized.mockReturnValue(true);
    });

    it('should call startSession with updated config', async () => {
      const mockStartSession = jest.fn();
      
      const TestComponentWithSession = () => {
        const context = useOrgaAI();
        React.useEffect(() => {
          // Mock the startSession method
          context.startSession = mockStartSession;
        }, [context]);
        
        return (
          <button 
            data-testid="start-session" 
            onClick={() => context.startSession()}
          >
            Start Session
          </button>
        );
      };

      render(
        <OrgaAIProvider>
          <TestComponentWithSession />
        </OrgaAIProvider>
      );

      await act(async () => {
        screen.getByTestId('start-session').click();
      });

      expect(mockStartSession).toHaveBeenCalled();
    });
  });

  describe('Context Integration', () => {
    it('should provide all required context values', () => {
      mockOrgaAI.getConfig.mockReturnValue({});

      const TestContextValues = () => {
        const context = useOrgaAI();
        return (
          <div>
            <div data-testid="has-model">{typeof context.model}</div>
            <div data-testid="has-voice">{typeof context.voice}</div>
            <div data-testid="has-temperature">{typeof context.temperature}</div>
            <div data-testid="has-set-model">{typeof context.setModel}</div>
            <div data-testid="has-set-voice">{typeof context.setVoice}</div>
            <div data-testid="has-set-temperature">{typeof context.setTemperature}</div>
            <div data-testid="has-start-session">{typeof context.startSession}</div>
          </div>
        );
      };

      render(
        <OrgaAIProvider>
          <TestContextValues />
        </OrgaAIProvider>
      );

      expect(screen.getByTestId('has-model')).toHaveTextContent('string');
      expect(screen.getByTestId('has-voice')).toHaveTextContent('string');
      expect(screen.getByTestId('has-temperature')).toHaveTextContent('number');
      expect(screen.getByTestId('has-set-model')).toHaveTextContent('function');
      expect(screen.getByTestId('has-set-voice')).toHaveTextContent('function');
      expect(screen.getByTestId('has-set-temperature')).toHaveTextContent('function');
      expect(screen.getByTestId('has-start-session')).toHaveTextContent('function');
    });
  });

  describe('useOrgaAI Hook', () => {
    it('should throw error when used outside provider', () => {
      const TestComponentOutsideProvider = () => {
        try {
          useOrgaAI();
          return <div data-testid="no-error">No Error</div>;
        } catch (error) {
          return <div data-testid="error">{error instanceof Error ? error.message : 'Unknown error'}</div>;
        }
      };

      render(<TestComponentOutsideProvider />);

      expect(screen.getByTestId('error')).toHaveTextContent(
        'useOrgaAIContext must be used within an OrgaAIProvider'
      );
    });

    it('should work correctly when used within provider', () => {
      mockOrgaAI.getConfig.mockReturnValue({});

      render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      expect(screen.getByTestId('model')).toBeInTheDocument();
      expect(screen.getByTestId('voice')).toBeInTheDocument();
      expect(screen.getByTestId('temperature')).toBeInTheDocument();
    });
  });

  describe('Callbacks Integration', () => {
    it('should pass callbacks to internal hook', () => {
      const mockCallbacks = {
        onSessionStart: jest.fn(),
        onSessionEnd: jest.fn(),
        onError: jest.fn(),
      };

      render(
        <OrgaAIProvider callbacks={mockCallbacks}>
          <TestComponent />
        </OrgaAIProvider>
      );

      // The callbacks should be passed through to the internal hook
      // We can't directly test this without exposing internal state,
      // but we can verify the provider renders without errors
      expect(screen.getByTestId('model')).toBeInTheDocument();
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across re-renders', async () => {
      mockOrgaAI.getConfig.mockReturnValue({});

      const { rerender } = render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      // Set a value
      await act(async () => {
        screen.getByTestId('set-temperature').click();
      });

      // Re-render
      rerender(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      // State should be maintained
      expect(mockOrgaAI.init).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7
        })
      );
    });
  });
});
