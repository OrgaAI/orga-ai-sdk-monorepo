import type { OrgaAIConfig } from '../types';
import { ConfigurationError } from '../errors';
import { ORGAAI_TEMPERATURE_RANGE, ORGAAI_MODELS } from '../types';
import { DEFAULT_ORGAAI_VOICE } from '../types/OrgaVoices';

/**
 * Global type augmentation for OrgaAI SDK state
 */
declare global {
  var OrgaAI: {
    config: OrgaAIConfig;
    isInitialized: boolean;
  } | undefined;
}

/**
 * Core OrgaAI client class
 * 
 * This is a singleton that manages global SDK configuration.
 * It must be initialized before any SDK features can be used.
 * 
 * @example
 * ```typescript
 * import { OrgaAI } from '@orga-ai/core';
 * 
 * OrgaAI.init({
 *   sessionConfigEndpoint: 'https://api.example.com/session',
 *   logLevel: 'info',
 *   model: 'orga-1-beta',
 *   voice: 'Victoria',
 * });
 * ```
 */
export class OrgaAI {
  private static instance: OrgaAI;
  
  private constructor() {}
  
  /**
   * Initialize the Orga AI SDK with configuration
   * 
   * @param config - SDK configuration options
   * @throws {ConfigurationError} If configuration is invalid
   */
  static init(config: OrgaAIConfig): void {
    // Validate temperature if provided
    if (
      config.temperature !== undefined &&
      (config.temperature < ORGAAI_TEMPERATURE_RANGE.min || 
       config.temperature > ORGAAI_TEMPERATURE_RANGE.max)
    ) {
      throw new ConfigurationError(
        `Temperature must be between ${ORGAAI_TEMPERATURE_RANGE.min} and ${ORGAAI_TEMPERATURE_RANGE.max}`
      );
    }

    // Validate session config endpoint or fetch function
    if (!config.sessionConfigEndpoint && !config.fetchSessionConfig) {
      throw new ConfigurationError(
        'Either sessionConfigEndpoint or fetchSessionConfig is required'
      );
    }

    // Setup fetch function
    let fetchFn: OrgaAIConfig['fetchSessionConfig'];
    
    if (config.fetchSessionConfig) {
      fetchFn = config.fetchSessionConfig;
    } else if (config.sessionConfigEndpoint) {
      // Import fetchSessionConfig dynamically to avoid circular deps
      // The platform-specific SDK will provide the actual implementation
      fetchFn = async () => {
        const { fetchSessionConfig } = await import('../utils');
        return fetchSessionConfig(config.sessionConfigEndpoint || '');
      };
    }
    
    const DEFAULT_MODEL = ORGAAI_MODELS[0];
    const DEFAULT_TEMPERATURE = 0.5;
    const existing = globalThis.OrgaAI?.config;

    // Merge config: prefer incoming values, but don't let provider defaults overwrite
    // explicit user choices (e.g. voice: "Alex" in init should not be replaced by
    // the default "Victoria" when wrappedStartSession merges in provider state).
    const merged: OrgaAIConfig = {
      logLevel: 'warn',
      timeout: 30000,
      ...config,
      fetchSessionConfig: fetchFn,
    };

    if (existing) {
      if (config.voice === DEFAULT_ORGAAI_VOICE && existing.voice && existing.voice !== DEFAULT_ORGAAI_VOICE) {
        merged.voice = existing.voice;
      }
      if (config.model === DEFAULT_MODEL && existing.model && existing.model !== DEFAULT_MODEL) {
        merged.model = existing.model;
      }
      if (config.temperature === DEFAULT_TEMPERATURE && existing.temperature != null && existing.temperature !== DEFAULT_TEMPERATURE) {
        merged.temperature = existing.temperature;
      }
    }

    // Store in global state
    globalThis.OrgaAI = {
      config: merged,
      isInitialized: true,
    };
  }
  
  /**
   * Get the current SDK configuration
   * 
   * @throws {ConfigurationError} If SDK has not been initialized
   * @returns The current SDK configuration
   */
  static getConfig(): OrgaAIConfig {
    if (!globalThis.OrgaAI?.isInitialized) {
      throw new ConfigurationError(
        'OrgaAI must be initialized before use. Call OrgaAI.init() first.'
      );
    }
    return globalThis.OrgaAI.config;
  }
  
  /**
   * Check if the SDK has been initialized
   * 
   * @returns True if initialized, false otherwise
   */
  static isInitialized(): boolean {
    return globalThis.OrgaAI?.isInitialized || false;
  }

  /**
   * Reset the SDK (mainly for testing)
   * @internal
   */
  static reset(): void {
    globalThis.OrgaAI = undefined;
  }
}

