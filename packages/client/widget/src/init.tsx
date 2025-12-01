import React from "react";
import { createRoot, Root } from "react-dom/client";
import { OrgaAI, OrgaAIProvider } from "@orga-ai/react";
import type { SessionConfigResponse, OrgaAIVoice } from "@orga-ai/core";
import { WidgetApp } from "./WidgetApp";
import { buildWidgetRuntimeConfig, type WidgetUiOptions } from "./config";
import { safeFetchSessionConfig } from "./utils/safeFetch";

export type WidgetInitOptions = {
  /**
   * HTMLElement or selector that will host the widget UI.
   * Defaults to the first element with `[data-orga-widget]`.
   */
  target?: HTMLElement | string;
  /**
   * Function that returns the session configuration (ephemeral token + ICE servers).
   * Mirrors the existing React SDK requirement so we can reuse backends.
   */
  fetchSessionConfig: () => Promise<SessionConfigResponse>;
  /**
   * Optional session configuration endpoint to seed OrgaAI.init.*/
  sessionConfigEndpoint?: string;
  /**
   * Optional voice/model configuration to seed OrgaAI.init.
   */
  voice?: OrgaAIVoice;
  /**
   * Logging verbosity override.
   */
  logLevel?: "disabled" | "error" | "warn" | "info" | "debug";
  /**
   * UI customization options (themes, branding, feature toggles).
   */
  ui?: WidgetUiOptions;
};

const DEFAULT_SELECTOR = "[data-orga-widget]";
let widgetRoot: Root | null = null;
let isInitialized = false;

const resolveTarget = (target?: HTMLElement | string): HTMLElement => {
  if (typeof target === "string") {
    const node = document.querySelector<HTMLElement>(target);
    if (!node) {
      throw new Error(
        `[OrgaWidget] Unable to find target node for selector "${target}".`
      );
    }
    return node;
  }

  if (target) {
    return target;
  }

  const fallback = document.querySelector<HTMLElement>(DEFAULT_SELECTOR);
  if (!fallback) {
    throw new Error(
      `[OrgaWidget] Missing mount point. Provide a target or add ${DEFAULT_SELECTOR} to the DOM.`
    );
  }
  return fallback;
};

 export const initWidget = (options: WidgetInitOptions) => {
  if (!options || typeof options.fetchSessionConfig !== "function") {
    throw new Error(
      "[OrgaWidget] fetchSessionConfig is required to initialize the widget."
    );
  }

  const hostNode = resolveTarget(options.target);

  const uiConfig = buildWidgetRuntimeConfig(options.ui);

  const safeFetch = () =>
    safeFetchSessionConfig(options.fetchSessionConfig, {
      endpointLabel: options.sessionConfigEndpoint,
    });

  if (!isInitialized) {
    OrgaAI.init({
      fetchSessionConfig: safeFetch,
      // fetchSessionConfig: options.fetchSessionConfig,
      voice: options.voice ?? "fable",
      logLevel: options.logLevel ?? "info",
      sessionConfigEndpoint: options.sessionConfigEndpoint ?? undefined,
      enableTranscriptions: uiConfig.features.transcript !== "hidden",
    });
    isInitialized = true;
  }

  if (!widgetRoot) {
    widgetRoot = createRoot(hostNode);
  }

  widgetRoot.render(
    <OrgaAIProvider>
      <WidgetApp config={uiConfig} />
    </OrgaAIProvider>
  );

  if (typeof window !== "undefined") {
    const nextOrgaWidget = {
      ...(window.OrgaWidget ?? {}),
      initWidget,
      version: "0.0.1", 
    };
  
    try {
      window.OrgaWidget = Object.freeze(nextOrgaWidget);
    } catch {
      window.OrgaWidget = nextOrgaWidget;
      console.warn("[OrgaWidget] Unable to freeze global API; continuing unfrozen.");
    }
  }
};


export type {
  WidgetUiOptions,
  WidgetThemeName,
  WidgetFeatureConfig,
  WidgetBranding,
} from "./config";

declare global {
  interface Window {
    OrgaWidget?: {
      initWidget: typeof initWidget;
    };
  }
}