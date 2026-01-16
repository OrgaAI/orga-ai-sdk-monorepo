import type { OrgaAIConfig } from '../types';
import { ConfigurationError } from '../errors';
import { ORGAAI_TEMPERATURE_RANGE } from '../types';
import { initTelemetry } from '../telemetry';

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
 *   voice: 'alloy',
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
    
    // Create default config with user overrides
    const defaultConfig: OrgaAIConfig = {
      logLevel: 'warn',
      timeout: 30000,
      ...config,
      fetchSessionConfig: fetchFn,
    };

    // Initialize telemetry if requested TODO: Change from default of true
    if (defaultConfig.telemetry?.enableTelemetry || true) { //Update to === true
      initTelemetry({
        serviceName: defaultConfig.telemetry?.serviceName ?? 'orga-ai-sdk',
        environment: defaultConfig.telemetry?.environment ?? 'production',
        region: defaultConfig.telemetry?.region ?? 'eu-central-2',
        enableTelemetry: true,
        traceUrl: defaultConfig.telemetry?.traceUrl,
        metricsUrl: defaultConfig.telemetry?.metricsUrl,
        metricExportIntervalMs: defaultConfig.telemetry?.metricExportIntervalMs,
      });
    }
    
    // Store in global state
    globalThis.OrgaAI = {
      config: defaultConfig,
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

