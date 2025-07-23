export const ORGAAI_MODELS = ["Orga (1) beta", "Orga (1)"] as const;
export type OrgaAIModel = typeof ORGAAI_MODELS[number];

export const ORGAAI_VOICES = ["Dora", "Sandra"] as const;
export type OrgaAIVoice = typeof ORGAAI_VOICES[number];


export const ORGAAI_TEMPERATURE_RANGE = {
  min: 0.0,
  max: 1.0,
};

export interface OrgaAIConfig {
  logLevel?: "debug" | "info" | "warn" | "error" | "none";
  timeout?: number;
  ephemeralEndpoint?: string; // When provided we fetch from their backend. Assumes that the backend doesnt need a token or additional configuration.
  fetchEphemeralTokenAndIceServers?: () => Promise<{
    ephemeralToken: string;
    iceServers: RTCIceServer[];
  }>;
  //FetchEphemeralToken is a function that fetches a token from the backend.
  //This allows them to setup the call sending the necessary tokens and headers.
  // Optional parameters can be passed to create default values for the session config
  model?: OrgaAIModel; // <-- not OrgaAIModel | string
  voice?: OrgaAIVoice;
  temperature?: number; // TODO: Add temperature options (0.0 - 1.0)
  maxTokens?: number; // TODO: Add maxTokens options (100 - 1000)
}
