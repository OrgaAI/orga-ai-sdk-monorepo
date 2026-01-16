import { OrgaAIConfig, SessionConfig, IceServer } from "./types";
import {
  OrgaAIError,
  OrgaAIAuthenticationError,
  OrgaAIServerError,
} from "./errors";
import { Telemetry } from "./telemetry/init";
import { SpanStatusCode } from "@opentelemetry/api";

export class OrgaAI {
  private telemetry = new Telemetry();
  private apiKey: string;
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

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.orga-ai.com";
    this.debug = config.debug || false;
    this.timeout = config.timeout || 10000;

    this.telemetry.initialize({
      serviceName: "orga-ai-sdk",
      enableTelemetry: config.enableTelemetry || false,
    });

    if (config.enableTelemetry) {
      // Initialize metric instruments once
      const meter = this.telemetry.getMeter();
      this.latencyHistogram = meter.createHistogram(
        "orga.node.operation.latency",
        {
          description: "Latency of SDK operations",
          unit: "ms",
        }
      );
      this.errorCounter = meter.createCounter("orga.node.errors", {
        description: "Number of SDK errors",
      });
      // Initialize error counter to 0 so it exists as a time series
      this.errorCounter.add(0, {
        "operation.name": "_init",
        "error.type": "none",
        "deployment.region": "eu-central-2",
      });
      this.opCounter = meter.createCounter("orga.node.operation.count", {
        description: "Number of SDK operations",
      });
      this.statusCounter = meter.createCounter("orga.node.http.status", {
        description: "HTTP status codes",
      });
      this.apiLatencyHistogram = meter.createHistogram(
        "orga.node.api.operation.latency",
        {
          description: "Latency of API operations",
          unit: "ms",
        }
      );
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
    // Use spans for nested operations to see breakdown
    const tracer = this.telemetry.getTracer();
    const span = tracer.startSpan("getSessionConfig", {
      attributes: {
        "operation.type": "session-config",
        "service.name": "orga-ai-node",
      },
    });

    const startTime = Date.now();
    try {
      this.log("Fetching session config");
      const ephemeralToken = await this.fetchEphemeralToken();
      this.log("Fetched ephemeral token", ephemeralToken);
      const iceServers = await this.fetchIceServers(ephemeralToken);
      this.log("Fetched ICE servers", iceServers);

      const duration = Date.now() - startTime;
      span.setStatus({ code: SpanStatusCode.OK });
      this.recordSuccess("getSessionConfig", duration);
      span.end();

      return {
        ephemeralToken,
        iceServers,
      };
    } catch (error) {
      if (error instanceof Error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.recordException(error);
        this.recordError("getSessionConfig", error);
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
    // Child span - shows up under getSessionConfig in traces
    const tracer = this.telemetry.getTracer();
    const span = tracer.startSpan("fetchEphemeralToken", {
      attributes: {
        "operation.type": "ephemeral-token",
        "http.url": `${this.baseUrl}/v1/realtime/client-secrets`,
        "service.name": "orga-ai-node",
      },
    });

    const startTime = Date.now();

    try {
      const apiUrl = `${this.baseUrl}/v1/realtime/client-secrets`;
      const response = await this.fetchWithTimeout(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      span.setAttribute("http.status_code", response.status);
      if (!response.ok) {
        if (response.status === 401) {
          throw new OrgaAIAuthenticationError("Invalid API key");
        }
        this.recordStatus(response.status);
        throw new OrgaAIServerError(
          `Failed to fetch ephemeral token: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      span.setStatus({ code: SpanStatusCode.OK });
      this.recordSuccess("fetchEphemeralToken", Date.now() - startTime);
      this.recordStatus(response.status);
      span.end();
      return data.ephemeral_token;
    } catch (error) {
      if (error instanceof Error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.recordException(error);
        this.recordError("fetchEphemeralToken", error);
      }
      span.end();

      if (error instanceof OrgaAIError) {
        throw error;
      }
      throw new OrgaAIServerError(
        `Failed to fetch ephemeral token: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private async fetchIceServers(ephemeralToken: string): Promise<IceServer[]> {
    // Child span - shows up under getSessionConfig in traces
    const tracer = this.telemetry.getTracer();
    const span = tracer.startSpan("fetchIceServers", {
      attributes: {
        "operation.type": "ice-servers",
        "http.url": `${this.baseUrl}/v1/realtime/ice-config`,
        "service.name": "orga-ai-node",
      },
    });

    const startTime = Date.now();
    try {
      const url = `${this.baseUrl}/v1/realtime/ice-config`;

      const response = await this.fetchWithTimeout(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
        },
      });

      span.setAttribute("http.status_code", response.status);
      if (!response.ok) {
        this.recordStatus(response.status);
        throw new OrgaAIServerError(
          `Failed to fetch ICE servers: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      span.setStatus({ code: SpanStatusCode.OK });
      this.recordSuccess("fetchIceServers", Date.now() - startTime);
      this.recordStatus(response.status);
      span.end();
      return data.iceServers;
    } catch (error) {
      if (error instanceof Error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.recordException(error);
        this.recordError("fetchIceServers", error);
      }
      span.end();

      if (error instanceof OrgaAIError) {
        throw error;
      }
      throw new OrgaAIServerError(
        `Failed to fetch ICE servers: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  // --- Telemetry helpers ---
  private recordSuccess(operationName: string, durationMs: number) {
    if (
      !this.telemetry.isTelemetryEnabled() ||
      !this.latencyHistogram ||
      !this.opCounter
    )
      return;
    this.latencyHistogram.record(durationMs, {
      "operation.name": operationName,
      "deployment.region": "eu-central-2",
    });

    // Also record on API-specific metric if it's an API call
    if (operationName.startsWith("fetch")) {
      this.apiLatencyHistogram?.record(durationMs, {
        "api.operation": operationName,
        "deployment.region": "eu-central-2",
      });
    }

    this.opCounter.add(1, {
      "operation.name": operationName,
      "deployment.region": "eu-central-2",
    });
  }

  private recordError(operationName: string, error: Error) {
    if (!this.telemetry.isTelemetryEnabled() || !this.errorCounter) return;
    this.errorCounter.add(1, {
      "operation.name": operationName,
      "error.type": error.constructor.name,
      "deployment.region": "eu-central-2",
    });
  }

  private recordStatus(statusCode: number) {
    if (!this.telemetry.isTelemetryEnabled() || !this.statusCounter) return;
    this.statusCounter.add(1, {
      "http.status_code": statusCode,
      "deployment.region": "eu-central-2",
    });
  }
}
