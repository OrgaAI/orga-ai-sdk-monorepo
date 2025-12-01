import { OrgaAIConfig, SessionConfig, IceServer } from "./types";
import {
  OrgaAIError,
  OrgaAIAuthenticationError,
  OrgaAIServerError,
} from "./errors";

export class OrgaAI {
  private apiKey: string;
  private baseUrl: string;
  private debug: boolean;
  private timeout: number;

  constructor(config: OrgaAIConfig) {
    if (!config.apiKey) {
      throw new OrgaAIError("API key is required");
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.orga-ai.com";
    this.debug = config.debug || false;
    this.timeout = config.timeout || 10000;
  }
  private log(message: string, data?: any) {
    if (this.debug) {
      console.log(`[OrgaAI] ${message}`, data);
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * @description Get session configuration for the user
   * @returns ephemeral token and ICE servers needed for WebRTC connection
   */
  async getSessionConfig(): Promise<SessionConfig> {
    try {
      this.log("Fetching session config");
      const ephemeralToken = await this.fetchEphemeralToken();
      this.log("Fetched ephemeral token", ephemeralToken);
      const iceServers = await this.fetchIceServers(ephemeralToken);
      this.log("Fetched ICE servers", iceServers);
      return {
        ephemeralToken,
        iceServers,
      };
    } catch (error) {
      if (error instanceof OrgaAIError) {
        throw error;
      }
      throw new OrgaAIServerError(
        `Failed to get session config: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private async fetchEphemeralToken(): Promise<string> {
    const apiUrl = `${this.baseUrl}/v1/realtime/client-secrets`;

    const response = await this.fetchWithTimeout(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new OrgaAIAuthenticationError("Invalid API key");
      }
      throw new OrgaAIServerError(
        `Failed to fetch ephemeral token: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data.ephemeral_token;
  }

  private async fetchIceServers(ephemeralToken: string): Promise<IceServer[]> {
    const url = `${this.baseUrl}/v1/realtime/ice-config`;

    const response = await this.fetchWithTimeout(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ephemeralToken}`,
      },
    });

    if (!response.ok) {
      throw new OrgaAIServerError(
        `Failed to fetch ICE servers: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data.iceServers;
  }
}
