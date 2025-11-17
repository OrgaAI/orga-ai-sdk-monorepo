import { trace, metrics } from "@opentelemetry/api";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { ZoneContextManager } from "@opentelemetry/context-zone";

export interface TelemetryConfig {
  serviceName: string;
  environment?: string;
  region?: string;
  enableTelemetry: boolean;
  traceUrl?: string;
  metricsUrl?: string;
  metricExportIntervalMs?: number;
}

export class Telemetry {
  private tracerProvider: WebTracerProvider | null = null;
  private meterProvider: MeterProvider | null = null;
  private isInitialized = false;
  private tracer: ReturnType<typeof trace.getTracer> | null = null;

  initialize(config: TelemetryConfig) {
    if (this.isInitialized || !config.enableTelemetry) return;

    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: config.serviceName || "orga-ai-react",
      "deployment.environment": config.environment ?? "production",
      "deployment.region": config.region ?? "eu-central-2",
    });

    // Tracing - WebTracerProvider accepts spanProcessors in constructor
    const traceExporter = new OTLPTraceExporter({
      url: config.traceUrl ?? "http://localhost:4318/v1/traces",
    });

    const provider = new WebTracerProvider({
      resource,
      spanProcessors: [new BatchSpanProcessor(traceExporter)],
    });

    // Register with ZoneContextManager (official pattern)
    provider.register({
      contextManager: new ZoneContextManager(),
    });

    this.tracerProvider = provider;

    // Metrics
    const metricExporter = new OTLPMetricExporter({
      url: config.metricsUrl ?? "http://localhost:4318/v1/metrics",
    });
    const metricReader = new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: config.metricExportIntervalMs ?? 5000,
    });

    this.meterProvider = new MeterProvider({
      resource,
      readers: [metricReader],
    });
    metrics.setGlobalMeterProvider(this.meterProvider);

    this.tracer = trace.getTracer(config.serviceName);
    this.isInitialized = true;
  }

  async shutdown(): Promise<void> {
    const shutdowns: Promise<unknown>[] = [];
    if (this.tracerProvider) {
      shutdowns.push(this.tracerProvider.shutdown());
      this.tracerProvider = null;
    }
    if (this.meterProvider) {
      shutdowns.push(this.meterProvider.shutdown());
      this.meterProvider = null;
    }
    this.isInitialized = false;
    await Promise.allSettled(shutdowns);
  }

  getTracer() {
    if (!this.tracer) this.tracer = trace.getTracer("orga-ai-web");
    return this.tracer;
  }

  getMeter() {
    return metrics.getMeter("orga-ai-web");
  }

  isTelemetryEnabled() {
    return this.isInitialized;
  }

  recordCustomMetric(
    name: string,
    value: number,
    attributes?: Record<string, string | number | boolean>
  ) {
    if (!this.isInitialized) return;
    const counter = this.getMeter().createCounter(name, {
      description: `Custom metric: ${name}`,
      unit: "1",
    });
    counter.add(value, attributes);
  }
}