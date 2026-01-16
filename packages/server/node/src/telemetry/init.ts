import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { trace, metrics } from "@opentelemetry/api";

export interface TelemetryConfig {
  serviceName: string;
  region?: string;
  enableTelemetry: boolean;
}

export class Telemetry {
  private sdk: NodeSDK | null = null;
  private tracer: ReturnType<typeof trace.getTracer> | null = null;
  private meter: ReturnType<typeof metrics.getMeter> | null = null;
  private isInitialized = false;

  initialize(config: TelemetryConfig) {
    if (this.isInitialized || !config.enableTelemetry) {
    //   console.log(
    //     config.enableTelemetry
    //       ? "Telemetry already initialized"
    //       : "Telemetry disabled"
    //   );
      return;
    }

    // Create custom exporters with logging
    // TODO: Replace with actual OTLP collector URL
    // For local testing: http://localhost:4318/v1/traces
    // For production: http://your-actual-domain.com:4318/v1/traces
    const traceExporter = new OTLPTraceExporter({
      url: "http://localhost:4318/v1/traces",
    });

    const metricExporter = new OTLPMetricExporter({
      url: "http://localhost:4318/v1/metrics",
    });

    // Add logging to exporters
    const originalExport = metricExporter.export;
    metricExporter.export = (metrics, resultCallback) => {
      const result = originalExport.call(metricExporter, metrics, (result) => {
        if (result.code === 0) {
        //   console.log("✅ Metrics exported successfully");
        } else {
        //   console.log("❌ Metrics export failed:", result.code, result.error);
        }
        if (resultCallback) resultCallback(result);
      });
      return result;
    };

    this.sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: config.serviceName || "orga-ai-sdk",
        "deployment.environment": "production",
        "deployment.region": config.region || "eu-central-2",
      }),
      traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 5000,
      }),
    });

    this.sdk.start();
    // Initialize tracer/meter AFTER SDK start so they are wired to the SDK (not NOOP)
    this.tracer = trace.getTracer("orga-ai-sdk");
    this.meter = metrics.getMeter("orga-ai-sdk");
    this.isInitialized = true;
  }

  shutdown() {
    if (this.sdk && this.isInitialized) {
    //   console.log("Shutting down OpenTelemetry SDK...");
      this.isInitialized = false;
      return this.sdk.shutdown();
    }
    return Promise.resolve();
  }

  getTracer() {
    if (!this.tracer) {
      this.tracer = trace.getTracer("orga-ai-sdk");
    }
    return this.tracer;
  }

  getMeter() {
    if (!this.meter) {
      this.meter = metrics.getMeter("orga-ai-sdk");
    }
    return this.meter;
  }

  isTelemetryEnabled() {
    return this.isInitialized;
  }



  // Method to manually record custom metrics
  recordCustomMetric(
    name: string,
    value: number,
    attributes?: Record<string, string>
  ) {
    if (!this.isInitialized) {
    //   console.warn("⚠️ Telemetry not initialized, cannot record metric"); 
      return;
    }

    const counter = this.getMeter().createCounter(name, {
      description: `Custom metric: ${name}`,
      unit: "1",
    });

    counter.add(value, attributes);
    // console.log(`📊 Recorded custom metric: ${name} = ${value}`, attributes);
  }
}