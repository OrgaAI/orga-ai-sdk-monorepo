import type { SessionConfigResponse } from "@orga-ai/core";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 1;

export type SafeFetchOptions = {
  /**
   * Human-readable label that will be included in error messages.
   * Useful when integrators pass a named endpoint.
   */
  endpointLabel?: string;
  /**
   * Maximum amount of time to wait for the promise before aborting.
   * Defaults to 10 seconds which balances DX and network variance.
   */
  timeoutMs?: number;
  /**
   * Number of retries after the initial attempt fails.
   * Defaults to 1 retry with exponential backoff.
   */
  maxRetries?: number;
  /**
   * Hook that fires whenever a retry occurs so callers can log/trace.
   */
  onRetry?: (attempt: number, error: unknown) => void;
};

/**
 * Wraps the user-provided `fetchSessionConfig` function with guard rails so
 * transient failures, slow responses, and malformed payloads result in helpful
 * errors instead of a permanently spinning widget.
 */
export const safeFetchSessionConfig = async (
  fetchFn: () => Promise<SessionConfigResponse>,
  options?: SafeFetchOptions
): Promise<SessionConfigResponse> => {
  enforceSecureContext();

  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = Math.max(0, options?.maxRetries ?? DEFAULT_MAX_RETRIES);
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await withTimeout(fetchFn(), timeoutMs);
        return validateSessionConfig(result);
      } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        options?.onRetry?.(attempt + 1, error);
        await delay(200 * Math.pow(2, attempt));
        continue;
      }
    }
  }

  throw formatSessionError(lastError, options?.endpointLabel);
};

/**
 * Ensures we only run inside secure contexts. WebRTC + getUserMedia are blocked
 * over HTTP and surfacing that early avoids confusing permission errors.
 */
const enforceSecureContext = () => {
  if (typeof window === "undefined") {
    return;
  }
  if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
    console.warn(
      "[OrgaWidget] This widget requires HTTPS for microphone and camera access. Current origin:",
      window.location.origin
    );
  }
};

/**
 * Rejects the wrapped promise if it does not resolve within the specified
 * timeout. This prevents the UI from hanging indefinitely on slow networks.
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Session configuration request timed out."));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Ensures the backend returned the fields we need to establish the WebRTC
 * session. Returning early with descriptive errors makes debugging much easier.
 */
const validateSessionConfig = (
  payload: SessionConfigResponse
): SessionConfigResponse => {
  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.ephemeralToken !== "string" ||
    !Array.isArray(payload.iceServers)
  ) {
    throw new Error(
      "[OrgaWidget] Session config response is malformed. Ensure the endpoint returns { ephemeralToken, iceServers }."
    );
  }
  return payload;
};

const formatSessionError = (error: unknown, label?: string) => {
  const message =
    error instanceof Error ? error.message : "Unknown session configuration error.";
  const suffix = label ? ` (Source: ${label})` : "";
  return new Error(`${message}${suffix}`);
};
