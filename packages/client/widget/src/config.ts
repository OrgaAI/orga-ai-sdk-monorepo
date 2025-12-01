import type { CSSProperties } from "react";
import {sanitizeBranding, sanitizeOverrides} from "./utils"

export type WidgetThemeName = "floating-badge" | "panel" | "full";

export type TranscriptMode = "hidden" | "panel";

export type VideoPreviewMode = "hidden" | "optional" | "always";

export type WidgetBranding = {
  brandName: string;
  tagline?: string;
  accentColor: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  secondaryTextColor: string;
  badgeIconUrl?: string;
  logoUrl?: string;
  logoAlt?: string;
};

export type WidgetFeatureConfig = {
  transcript: TranscriptMode;
  videoPreview: VideoPreviewMode;
};

export type WidgetStyleOverrides = {
  cssVariables?: Record<string, string>;
  className?: string;
};

export type WidgetUiOptions = {
  theme?: WidgetThemeName;
  branding?: Partial<WidgetBranding>;
  features?: Partial<WidgetFeatureConfig>;
  overrides?: WidgetStyleOverrides;
};

export type WidgetRuntimeConfig = {
  theme: WidgetThemeName;
  branding: WidgetBranding;
  features: WidgetFeatureConfig;
  overrides: WidgetStyleOverrides;
};

const DEFAULT_BRANDING: WidgetBranding = {
  brandName: "Orga Assistant",
  tagline: "Your realtime copilot",
  accentColor: "#2D9FBC",
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  textColor: "#0f172a",
  secondaryTextColor: "#475569",
};

const DEFAULT_FEATURES: WidgetFeatureConfig = {
  transcript: "panel",
  videoPreview: "optional",
  // theme: "floating-badge",
};

export const buildWidgetRuntimeConfig = (
  options?: WidgetUiOptions
): WidgetRuntimeConfig => {
  const mergedBranding: WidgetBranding = {
    ...DEFAULT_BRANDING,
    ...options?.branding,
  };

  const branding = sanitizeBranding(mergedBranding);

  return {
    theme: options?.theme ?? "floating-badge",
    branding,
    features: {
      ...DEFAULT_FEATURES,
      ...options?.features,
    },
    overrides: sanitizeOverrides(options?.overrides),
  };
};

export const buildCssVariableMap = (
  config: WidgetRuntimeConfig
): CSSProperties => {
  const cssVars: CSSProperties & Record<string, string> = {
    "--orga-widget-accent": config.branding.accentColor,
    "--orga-widget-bg": config.branding.backgroundColor,
    "--orga-widget-border": config.branding.borderColor,
    "--orga-widget-primary": config.branding.textColor,
    "--orga-widget-secondary": config.branding.secondaryTextColor,
  };

  if (config.overrides?.cssVariables) {
    Object.assign(cssVars, config.overrides.cssVariables);
  }

  return cssVars;
};

