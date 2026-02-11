import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { OrgaAIProvider, useOrgaAI } from '../../hooks/OrgaAIProvider';
import { OrgaAI, logger } from '@orga-ai/core';
import { OrgaAIModel, OrgaAIVoice } from '../../types';

// Mock dependencies
jest.mock('@orga-ai/core', () => ({
  OrgaAI: {
    getConfig: jest.fn(),
    init: jest.fn(),
    isInitialized: jest.fn(),
  },
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  ConfigurationError: class ConfigurationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ConfigurationError';
    }
  },
  SessionError: class SessionError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'SessionError';
    }
  },
  ConnectionError: class ConnectionError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ConnectionError';
    }
  },
  ORGAAI_TEMPERATURE_RANGE: { min: 0, max: 1 },
  ORGAAI_MODELS: ['orga-1-beta'],
  ORGAAI_VOICES: [
    { name: 'Victoria', description: 'Reassuring Agent', gender: 'feminine', language: 'English' },
    { name: 'Juan', description: 'Formal Speaker', gender: 'masculine', language: 'Español' },
  ],
  DEFAULT_ORGAAI_VOICE: 'Victoria',
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
        onClick={() => context.setVoice('Victoria')}
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
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mocked functions
    (OrgaAI.getConfig as jest.Mock).mockClear();
    (OrgaAI.init as jest.Mock).mockClear();
    (OrgaAI.isInitialized as jest.Mock).mockClear();
    (logger.debug as jest.Mock).mockClear();
    (logger.info as jest.Mock).mockClear();
    (logger.warn as jest.Mock).mockClear();
    (logger.error as jest.Mock).mockClear();
    
    // Set up default mock implementations
    (OrgaAI.getConfig as jest.Mock).mockReturnValue({});
    (OrgaAI.init as jest.Mock).mockImplementation(() => {});
    (OrgaAI.isInitialized as jest.Mock).mockReturnValue(false);
  });

  describe('Provider Initialization', () => {
    it('should initialize with default values when no config exists', () => {
      (OrgaAI.getConfig as jest.Mock).mockReturnValue({});

      render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      expect(screen.getByTestId('model')).toHaveTextContent('orga-1-beta');
      expect(screen.getByTestId('voice')).toHaveTextContent('Victoria');
      expect(screen.getByTestId('temperature')).toHaveTextContent('0.5');
    });

    it('should initialize with config values when available', () => {
      (OrgaAI.getConfig as jest.Mock).mockReturnValue({
        model: 'orga-1-beta' as OrgaAIModel,
        voice: 'Juan' as OrgaAIVoice,
        temperature: 0.8,
      });

      render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      expect(screen.getByTestId('model')).toHaveTextContent('orga-1-beta');
      expect(screen.getByTestId('voice')).toHaveTextContent('Juan');
      expect(screen.getByTestId('temperature')).toHaveTextContent('0.8');
    });

    it('should handle partial config values', () => {
      (OrgaAI.getConfig as jest.Mock).mockReturnValue({
        model: 'orga-1-beta' as OrgaAIModel,
        // voice and temperature missing
      });

      render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      expect(screen.getByTestId('model')).toHaveTextContent('orga-1-beta');
      expect(screen.getByTestId('voice')).toHaveTextContent('Victoria'); // default
      expect(screen.getByTestId('temperature')).toHaveTextContent('0.5'); // default
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      (OrgaAI.getConfig as jest.Mock).mockReturnValue({});
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

      expect((OrgaAI.init as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'orga-1-beta'
        })
      );
      expect((logger as jest.Mocked<typeof logger>).debug).toHaveBeenCalledWith('[Model] Setting model to orga-1-beta');
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

      expect((OrgaAI.init as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          voice: 'Victoria'
        })
      );
      expect((logger as jest.Mocked<typeof logger>).debug).toHaveBeenCalledWith('[Voice] Setting voice to Victoria');
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

      expect((OrgaAI.init as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7
        })
      );
      expect((logger as jest.Mocked<typeof logger>).debug).toHaveBeenCalledWith('[Temperature] Setting temperature to 0.7');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      (OrgaAI.getConfig as jest.Mock).mockReturnValue({});
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

      expect((logger as jest.Mocked<typeof logger>).error).toHaveBeenCalledWith('[Model] Invalid model: invalid-model');
      expect((OrgaAI.init as jest.Mock)).not.toHaveBeenCalled();
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

      expect((logger as jest.Mocked<typeof logger>).error).toHaveBeenCalledWith('[Voice] Invalid voice: invalid-voice');
      expect((OrgaAI.init as jest.Mock)).not.toHaveBeenCalled();
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

      expect((logger as jest.Mocked<typeof logger>).error).toHaveBeenCalledWith('[Temperature] Invalid temperature: 2.5');
      expect((OrgaAI.init as jest.Mock)).not.toHaveBeenCalled();
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

      expect((OrgaAI.init as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0
        })
      );
      expect((logger as jest.Mocked<typeof logger>).error).not.toHaveBeenCalled();
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

      expect((OrgaAI.init as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 1
        })
      );
      expect((logger as jest.Mocked<typeof logger>).error).not.toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      (OrgaAI.getConfig as jest.Mock).mockReturnValue({});
      (OrgaAI.isInitialized as jest.Mock).mockReturnValue(true);
    });

    it('should provide startSession function in context', () => {
      render(
        <OrgaAIProvider>
          <TestComponent />
        </OrgaAIProvider>
      );

      // Verify that the startSession function is available in the context
      expect(screen.getByTestId('start-session')).toBeInTheDocument();
    });
  });

  describe('Context Integration', () => {
    it('should provide all required context values', () => {
      (OrgaAI.getConfig as jest.Mock).mockReturnValue({});

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
      (OrgaAI.getConfig as jest.Mock).mockReturnValue({});

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
      (OrgaAI.getConfig as jest.Mock).mockReturnValue({});

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
      expect((OrgaAI.init as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7
        })
      );
    });
  });
});
