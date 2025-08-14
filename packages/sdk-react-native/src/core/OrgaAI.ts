import { OrgaAIConfig } from '../types';
import { ConfigurationError } from '../errors';
import { fetchEphemeralTokenAndIceServers, logger } from '../utils';
import { ORGAAI_TEMPERATURE_RANGE } from '../types';

declare global {
  var OrgaAI: {
    config: OrgaAIConfig;
    isInitialized: boolean;
  } | undefined;
}

export class OrgaAI {
  private static instance: OrgaAI;
  
  private constructor() {}
  
  static init(config: OrgaAIConfig): void {
    // Validation for temperature
    if (
      config.temperature !== undefined &&
      (config.temperature < ORGAAI_TEMPERATURE_RANGE.min || config.temperature > ORGAAI_TEMPERATURE_RANGE.max)
    ) {
      throw new ConfigurationError(
        `Temperature must be between ${ORGAAI_TEMPERATURE_RANGE.min} and ${ORGAAI_TEMPERATURE_RANGE.max}`
      );
    }
    let fetchFn;
    if (!config.ephemeralEndpoint && !config.fetchEphemeralTokenAndIceServers) {
      throw new ConfigurationError('ephemeralEndpoint or fetchEphemeralTokenAndIceServers is required');
    }
    if (config.fetchEphemeralTokenAndIceServers) { 
      fetchFn = config.fetchEphemeralTokenAndIceServers;
    } else if (config.ephemeralEndpoint) { 
      fetchFn = () => fetchEphemeralTokenAndIceServers(config?.ephemeralEndpoint || "");
    } 
    
    const defaultConfig: OrgaAIConfig = {
      logLevel: 'warn',
      timeout: 30000,
      ...config,
      fetchEphemeralTokenAndIceServers: fetchFn
    };
    
    globalThis.OrgaAI = {
      config: defaultConfig,
      isInitialized: true
    };
    
    logger.info('OrgaAI SDK initialized');
  }
  
  static getConfig(): OrgaAIConfig {
    if (!globalThis.OrgaAI?.isInitialized) {
      throw new ConfigurationError('OrgaAI must be initialized before use. Call OrgaAI.init() first.');
    }
    return globalThis.OrgaAI.config;
  }
  
  static isInitialized(): boolean {
    return globalThis.OrgaAI?.isInitialized || false;
  }
}