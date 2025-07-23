import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { OrgaAIModel, OrgaAIVoice, ORGAAI_TEMPERATURE_RANGE, ORGAAI_MODELS, ORGAAI_VOICES } from '../types';
import { OrgaAI } from '../core/OrgaAI';
import { logger } from '../utils';

// Define the available options for model and voice
const DEFAULT_MODEL: OrgaAIModel = "Orga (1) beta";
const DEFAULT_VOICE: OrgaAIVoice = "Dora";
const DEFAULT_TEMPERATURE: number = 0.5;

// At the top of your file, define a minimal interface:
export interface OrgaAIHookBase {
  startSession: (...args: any[]) => Promise<any>;
  // Add other required members if needed
}

// Make the provider generic
export interface OrgaAIProviderProps<T> {
  children: ReactNode;
  useOrgaAI: (callbacks?: any) => T;
  callbacks?: any;
}

export type OrgaAIContextValue<T> = T & {
  model: OrgaAIModel;
  setModel: (model: OrgaAIModel) => void;
  voice: OrgaAIVoice;
  setVoice: (voice: OrgaAIVoice) => void;
  temperature: number;
  setTemperature: (temperature: number) => void;
}

// The context is also generic
export function createOrgaAIProvider<T extends OrgaAIHookBase>() {
  const OrgaAIContext = createContext<OrgaAIContextValue<T> | undefined>(undefined);

  const OrgaAIProvider: React.FC<OrgaAIProviderProps<T>> = ({
    children,
    useOrgaAI,
    callbacks,
  }) => {
    const config = OrgaAI.getConfig();
    const [model, _setModel] = useState<OrgaAIModel>(config.model ?? DEFAULT_MODEL);
    const [voice, _setVoice] = useState<OrgaAIVoice>(config.voice ?? DEFAULT_VOICE);
    const [temperature, _setTemperature] = useState<number>(
      config.temperature ?? DEFAULT_TEMPERATURE
    );

    // Validation helpers
    const isValidModel = (val: OrgaAIModel) => ORGAAI_MODELS.includes(val);
    const isValidVoice = (val: OrgaAIVoice) => ORGAAI_VOICES.includes(val);
    const isValidTemperature = (val: number) =>
      val >= ORGAAI_TEMPERATURE_RANGE.min && val <= ORGAAI_TEMPERATURE_RANGE.max;

    // Setters update both state and OrgaAI global config
    const setModel = (val: OrgaAIModel) => {
      logger.debug(`[Model] Setting model to ${val}`);
      if (isValidModel(val)) {
        _setModel(val);
        OrgaAI.init({ ...OrgaAI.getConfig(), model: val });
      } else {
        logger.error(`[Model] Invalid model: ${val}`);
      }
    };

    const setVoice = (val: OrgaAIVoice) => {
      logger.debug(`[Voice] Setting voice to ${val}`);
      if (isValidVoice(val)) {
        _setVoice(val);
        OrgaAI.init({ ...OrgaAI.getConfig(), voice: val });
      } else {
        logger.error(`[Voice] Invalid voice: ${val}`);
      }
    };

    const setTemperature = (val: number) => {
      logger.debug(`[Temperature] Setting temperature to ${val}`);
      if (isValidTemperature(val)) {
        _setTemperature(val);
        OrgaAI.init({ ...OrgaAI.getConfig(), temperature: val });
      } else {
        logger.error(`[Temperature] Invalid temperature: ${val}`);
      }
    };

    const orgaAI = useOrgaAI({ ...callbacks });

    // Always use the latest context values for session
    const wrappedStartSession = useCallback(
      async (sessionConfig = {}) => {
        const newConfig = { ...OrgaAI.getConfig(), model, voice, temperature };
        OrgaAI.init(newConfig);
        return orgaAI.startSession(sessionConfig);
      },
      [orgaAI, model, voice, temperature]
    );

    const contextValue: OrgaAIContextValue<T> = {
      ...orgaAI,
      startSession: wrappedStartSession,
      model,
      setModel,
      voice,
      setVoice,
      temperature,
      setTemperature,
    };

    return (
      <OrgaAIContext.Provider value={contextValue}>
        {children}
      </OrgaAIContext.Provider>
    );
  };

  function useOrgaAIContext(): OrgaAIContextValue<T> {
    const context = useContext(OrgaAIContext);
    if (!context) {
      throw new Error('useOrgaAIContext must be used within an OrgaAIProvider');
    }
    return context;
  }

  return { OrgaAIProvider, useOrgaAIContext };
} 