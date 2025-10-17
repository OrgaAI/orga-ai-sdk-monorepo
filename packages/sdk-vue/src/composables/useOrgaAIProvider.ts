import { ref, computed, provide, inject, type Ref } from 'vue';
import {
  OrgaAIComposableReturn,
  OrgaAIHookCallbacks,
  OrgaAIModel,
  OrgaAIVoice,
  SessionConfig,
} from '../types';
import { OrgaAI, ORGAAI_TEMPERATURE_RANGE, ORGAAI_MODELS, ORGAAI_VOICES, logger } from '@orga-ai/core';
import { useOrgaAI as useOrgaAIInternal } from './useOrgaAI';

// Define the available options for model and voice
const DEFAULT_MODEL: OrgaAIModel = "orga-1-beta";
const DEFAULT_VOICE: OrgaAIVoice = "alloy";
const DEFAULT_TEMPERATURE: number = 0.5;

// Injection key for the provider
const ORGA_AI_PROVIDER_KEY = Symbol('orga-ai-provider');

interface OrgaAIProviderReturn extends OrgaAIComposableReturn {
  model: Ref<OrgaAIModel>;
  setModel: (model: OrgaAIModel) => void;
  voice: Ref<OrgaAIVoice>;
  setVoice: (voice: OrgaAIVoice) => void;
  temperature: Ref<number>;
  setTemperature: (temperature: number) => void;
}

interface OrgaAIProviderOptions {
  callbacks?: OrgaAIHookCallbacks;
  initialModel?: OrgaAIModel;
  initialVoice?: OrgaAIVoice;
  initialTemperature?: number;
}

/**
 * Vue 3 Provider Composable - equivalent to React's OrgaAIProvider
 * 
 * This composable provides a global configuration state that can be shared
 * across all components in your Vue app. It follows Vue 3 best practices:
 * 
 * - Uses provide/inject for dependency injection
 * - Reactive state management with refs
 * - Computed properties for derived state
 * - Proper validation and error handling
 * 
 * Usage:
 * ```vue
 * <script setup>
 * import { useOrgaAIProvider } from '@orga-ai/vue';
 * 
 * // In your root component or app setup
 * const orgaAI = useOrgaAIProvider({
 *   callbacks: {
 *     onSessionStart: () => console.log('Session started'),
 *     onError: (error) => console.error('Error:', error)
 *   }
 * });
 * </script>
 * ```
 */
export function useOrgaAIProvider(options: OrgaAIProviderOptions = {}): OrgaAIProviderReturn {
  const {
    callbacks = {},
    initialModel = DEFAULT_MODEL,
    initialVoice = DEFAULT_VOICE,
    initialTemperature = DEFAULT_TEMPERATURE,
  } = options;

  // Get current config or use defaults
  const config = OrgaAI.getConfig();
  const model = ref<OrgaAIModel>(config.model ?? initialModel);
  const voice = ref<OrgaAIVoice>(config.voice ?? initialVoice);
  const temperature = ref<number>(config.temperature ?? initialTemperature);

  // Validation helpers
  const isValidModel = (val: OrgaAIModel) => ORGAAI_MODELS.includes(val);
  const isValidVoice = (val: OrgaAIVoice) => ORGAAI_VOICES.includes(val);
  const isValidTemperature = (val: number) => 
    val >= ORGAAI_TEMPERATURE_RANGE.min && val <= ORGAAI_TEMPERATURE_RANGE.max;

  // Setters update both state and OrgaAI global config
  const setModel = (val: OrgaAIModel) => {
    logger.debug(`[Model] Setting model to ${val}`);
    if (isValidModel(val)) {
      model.value = val;
      OrgaAI.init({ ...OrgaAI.getConfig(), model: val });
    } else {
      logger.error(`[Model] Invalid model: ${val}`);
    }
  };

  const setVoice = (val: OrgaAIVoice) => {
    logger.debug(`[Voice] Setting voice to ${val}`);
    if (isValidVoice(val)) {
      voice.value = val;
      OrgaAI.init({ ...OrgaAI.getConfig(), voice: val });
    } else {
      logger.error(`[Voice] Invalid voice: ${val}`);
    }
  };

  const setTemperature = (val: number) => {
    logger.debug(`[Temperature] Setting temperature to ${val}`);
    if (isValidTemperature(val)) {
      temperature.value = val;
      OrgaAI.init({ ...OrgaAI.getConfig(), temperature: val });
    } else {
      logger.error(`[Temperature] Invalid temperature: ${val}`);
    }
  };

  // Use the internal composable with callbacks
  const orgaAI = useOrgaAIInternal(callbacks);

  // Always use the latest context values for session
  const wrappedStartSession = async (sessionConfig: SessionConfig = {}) => {
    const newConfig = { ...OrgaAI.getConfig(), model: model.value, voice: voice.value, temperature: temperature.value };
    OrgaAI.init(newConfig);
    return orgaAI.startSession(sessionConfig);
  };

  const providerValue: OrgaAIProviderReturn = {
    ...orgaAI,
    startSession: wrappedStartSession,
    model,
    setModel,
    voice,
    setVoice,
    temperature,
    setTemperature,
  };

  // Provide the context to child components
  provide(ORGA_AI_PROVIDER_KEY, providerValue);

  return providerValue;
}

/**
 * Consumer composable - equivalent to React's useOrgaAI hook
 * 
 * This composable allows child components to access the OrgaAI provider
 * context. It should be used in components that are descendants of
 * a component that calls useOrgaAIProvider.
 * 
 * Usage:
 * ```vue
 * <script setup>
 * import { useOrgaAI } from '@orga-ai/vue';
 * 
 * // This will get the context from the nearest provider
 * const { startSession, model, setModel } = useOrgaAI();
 * </script>
 * ```
 */
export function useOrgaAI(): OrgaAIProviderReturn {
  const context = inject<OrgaAIProviderReturn>(ORGA_AI_PROVIDER_KEY);
  
  if (!context) {
    throw new Error(
      'useOrgaAI must be used within a component that calls useOrgaAIProvider. ' +
      'Make sure to call useOrgaAIProvider in a parent component first.'
    );
  }
  
  return context;
}

/**
 * Alternative: Direct composable without provider pattern
 * 
 * If you prefer not to use the provider pattern, you can use this
 * composable directly in any component. It provides the same functionality
 * but without global state sharing.
 * 
 * Usage:
 * ```vue
 * <script setup>
 * import { useOrgaAIComposable } from '@orga-ai/vue';
 * 
 * const orgaAI = useOrgaAIComposable({
 *   callbacks: { onError: console.error }
 * });
 * </script>
 * ```
 */
export function useOrgaAIComposable(callbacks: OrgaAIHookCallbacks = {}): OrgaAIComposableReturn {
  return useOrgaAIInternal(callbacks);
}
