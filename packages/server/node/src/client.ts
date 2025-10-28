import { SpanStatusCode } from '@opentelemetry/api';
import { OrgaAIConfig, SessionConfig, IceServer } from "./types";
import {
  OrgaAIError,
  OrgaAIAuthenticationError,
  OrgaAIServerError,
} from "./errors";
import { Telemetry } from "./init";

export class OrgaAI {
  private telemetry = new Telemetry();
  private apiKey: string;
  private userEmail: string;
  private baseUrl: string;
  private debug: boolean;
  private timeout: number;
  // Metrics instruments (initialized once when telemetry is enabled)
  private latencyHistogram: any | null = null;
  private errorCounter: any | null = null;
  private opCounter: any | null = null;
  private statusCounter: any | null = null;
  private apiLatencyHistogram: any | null = null;
  // private enableTelemetry: boolean;

  constructor(config: OrgaAIConfig) {
    if (!config.apiKey) {
      throw new OrgaAIError("API key is required");
    }
    if (!config.userEmail) {
      throw new OrgaAIError("User email is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.userEmail)) {
      throw new OrgaAIError("Invalid email format");
    }

    this.apiKey = config.apiKey;
    this.userEmail = config.userEmail;
    this.baseUrl = config.baseUrl || "https://api.orga-ai.com";
    this.debug = config.debug || false;
    this.timeout = config.timeout || 10000;

    console.log('🔧 Initializing OrgaAI client with telemetry:', config.enableTelemetry || false);
    this.telemetry.initialize({
      serviceName: 'orga-ai-node',
      enableTelemetry: config.enableTelemetry || false,
    });
    
    if (config.enableTelemetry) {
      console.log('✅ Telemetry enabled for OrgaAI client');
      // Initialize metric instruments once
      const meter = this.telemetry.getMeter();
      this.latencyHistogram = meter.createHistogram('sdk.operation.latency', {
        description: 'Latency of SDK operations',
        unit: 'ms',
      });
      this.errorCounter = meter.createCounter('sdk.errors', {
        description: 'Number of SDK errors',
      });
      this.opCounter = meter.createCounter('sdk.operation.count', {
        description: 'Number of SDK operations',
      });
      this.statusCounter = meter.createCounter('sdk.http.status', {
        description: 'HTTP status codes',
      });
      this.apiLatencyHistogram = meter.createHistogram('api.operation.latency', {
        description: 'Latency of API operations',
        unit: 'ms',
      });
    } else {
      console.log('⚠️ Telemetry disabled for OrgaAI client');
    }
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
    console.log('🎯 Starting getSessionConfig operation');
    
    const tracer = this.telemetry.getTracer();
    const span = tracer.startSpan('getSessionConfig', {
      attributes: { 'operation.type': 'session-config' },
    });

    const startTime = Date.now();
    console.log('📊 Created telemetry instruments for getSessionConfig');
    try {
      this.log("Fetching session config");
      const ephemeralToken = await this.fetchEphemeralToken();
      this.log("Fetched ephemeral token", ephemeralToken);
      const iceServers = await this.fetchIceServers(ephemeralToken);
      this.log("Fetched ICE servers", iceServers);

      const duration = Date.now() - startTime;
      console.log(`✅ getSessionConfig completed successfully in ${duration}ms`);
      
      span.setStatus({ code: SpanStatusCode.OK });
      this.recordSuccess('getSessionConfig', duration);

      console.log('📊 Recorded success metrics for getSessionConfig');
      span.end();

      return {
        ephemeralToken,
        iceServers,
      };
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      console.log(`❌ getSessionConfig failed after ${duration}ms:`, error);
      
      if (error instanceof Error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.recordException(error);
        this.recordError('getSessionConfig', error);
        console.log('📊 Recorded error metrics for getSessionConfig');
      }
      
      span.end();
      
      if (error instanceof OrgaAIError) {
        throw error;
      }
      throw new OrgaAIServerError(
        `Failed to get session config: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private async fetchEphemeralToken(): Promise<string> {
    const tracer = this.telemetry.getTracer();
    const span = tracer.startSpan('fetchEphemeralToken', {
      attributes: {
        'operation.type': 'ephemeral-token',
        'http.url': `${this.baseUrl}/v1/realtime/client-secrets`,
        'user.email': this.userEmail, // Will be redacted
      },
    });

    const startTime = Date.now();
    try {
      const apiUrl = `${this.baseUrl}/v1/realtime/client-secrets?email=${encodeURIComponent(this.userEmail)}`;
      const response = await this.fetchWithTimeout(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      span.setAttribute('http.status_code', response.status);
      if (!response.ok) {
        if (response.status === 401) {
          throw new OrgaAIAuthenticationError('Invalid API key or user email');
        }
        throw new OrgaAIServerError(
          `Failed to fetch ephemeral token: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      span.setStatus({ code: SpanStatusCode.OK });
      this.recordSuccess('fetchEphemeralToken', Date.now() - startTime);
      this.recordStatus(response.status);
      return data.ephemeral_token;
    } catch (error: unknown) {
      if (error instanceof Error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.recordException(error);
        this.recordError('fetchEphemeralToken', error);
      }
      throw new OrgaAIServerError(
        `Failed to fetch ephemeral token: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      span.end();
    }
  }

  private async fetchIceServers(ephemeralToken: string): Promise<IceServer[]> {
    const tracer = this.telemetry.getTracer();
    const span = tracer.startSpan('fetchIceServers', {
      attributes: {
        'operation.type': 'ice-servers',
        'http.url': `${this.baseUrl}/v1/realtime/ice-config`,
      },
    });

    const startTime = Date.now();
    try {
      const url = `${this.baseUrl}/v1/realtime/ice-config`;
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
        },
      });

      span.setAttribute('http.status_code', response.status);
      if (!response.ok) {
        throw new OrgaAIServerError(
          `Failed to fetch ICE servers: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      span.setStatus({ code: SpanStatusCode.OK });
      this.recordSuccess('fetchIceServers', Date.now() - startTime);
      this.recordStatus(response.status);
      return data.iceServers;
    } catch (error: unknown) {
      if (error instanceof Error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.recordException(error);
        this.recordError('fetchIceServers', error);
      }
      throw new OrgaAIServerError(
        `Failed to fetch ICE servers: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      span.end();
    }
  }

  // --- Telemetry helpers ---
  private recordSuccess(operationName: string, durationMs: number) {
    if (!this.telemetry.isTelemetryEnabled() || !this.latencyHistogram || !this.opCounter) return;
    this.latencyHistogram.record(durationMs, {
      'operation.name': operationName,
      'deployment.region': 'eu-central-2',
    });

  // Also record on API-specific metric if it's an API call
  if (operationName.startsWith('fetch')) {
    this.apiLatencyHistogram?.record(durationMs, {
      'api.operation': operationName,
      'deployment.region': 'eu-central-2',
    });
  }
    
    this.opCounter.add(1, {
      'operation.name': operationName,
      'deployment.region': 'eu-central-2',
    });
  }

  private recordError(operationName: string, error: Error) {
    if (!this.telemetry.isTelemetryEnabled() || !this.errorCounter) return;
    this.errorCounter.add(1, {
      'operation.name': operationName,
      'error.type': error.constructor.name,
      'deployment.region': 'eu-central-2',
    });
  }

  private recordStatus(statusCode: number) {
    if (!this.telemetry.isTelemetryEnabled() || !this.statusCounter) return;
    this.statusCounter.add(1, {
      'http.status_code': statusCode,
      'deployment.region': 'eu-central-2',
    });
  }
}
