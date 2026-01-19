import type { CSSProperties } from "react";
import { sanitizeBranding } from "./utils";

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

export type WidgetRuntimeConfig = {
  theme: WidgetThemeName;
  branding: WidgetBranding;
  features: WidgetFeatureConfig;
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

export const DEFAULT_FEATURES: WidgetFeatureConfig = {
  transcript: "panel",
  videoPreview: "optional",
};

export type WidgetConfigInput = {
  theme?: WidgetThemeName;
  transcript?: TranscriptMode;
  videoPreview?: VideoPreviewMode;
  branding?: Partial<WidgetBranding>;
};

export const buildWidgetRuntimeConfig = (
  options?: WidgetConfigInput
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
      transcript: options?.transcript ?? DEFAULT_FEATURES.transcript,
      videoPreview: options?.videoPreview ?? DEFAULT_FEATURES.videoPreview,
    },
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

  return cssVars;
};

