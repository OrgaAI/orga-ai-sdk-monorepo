import { SessionConfigResponse, OrgaAIVoice } from '@orga-ai/core';

type WidgetThemeName = "floating-badge" | "panel" | "full";
type TranscriptMode = "hidden" | "panel";
type VideoPreviewMode = "hidden" | "optional" | "always";
type WidgetBranding = {
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
    transcriptBackgroundColor?: string;
    assistantBubbleBackgroundColor?: string;
    assistantBubbleTextColor?: string;
};
type WidgetFeatureConfig = {
    transcript: TranscriptMode;
    videoPreview: VideoPreviewMode;
};

type WidgetInitOptions = {
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
     * Optional session configuration endpoint to seed OrgaAI.init.
     * Used only for logging / diagnostics.
     */
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
     * Theme/layout preset for the widget shell.
     */
    theme?: WidgetThemeName;
    /**
     * Controls whether the transcript panel is visible.
     */
    transcript?: TranscriptMode;
    /**
     * Controls camera preview behavior.
     */
    videoPreview?: VideoPreviewMode;
    /**
     * UI branding: name, tagline, and color palette.
     */
    branding?: Partial<WidgetBranding>;
};
declare const initWidget: (options: WidgetInitOptions) => void;
declare const destroyWidget: () => void;

declare global {
    interface Window {
        OrgaWidget?: {
            initWidget: typeof initWidget;
            destroyWidget: typeof destroyWidget;
            version?: string;
        };
    }
}

export { type TranscriptMode, type VideoPreviewMode, type WidgetBranding, type WidgetFeatureConfig, type WidgetInitOptions, type WidgetThemeName, destroyWidget, initWidget };
