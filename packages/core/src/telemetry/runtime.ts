import { Telemetry, TelemetryConfig } from './init';

let telemetry: Telemetry | null = null;

export function initTelemetry(config: TelemetryConfig) {
  if (!telemetry) telemetry = new Telemetry();
  telemetry.initialize(config);
  return telemetry;
}

export function getTelemetry() {
  if (!telemetry) telemetry = new Telemetry(); // NOOP until initialized
  return telemetry;
}