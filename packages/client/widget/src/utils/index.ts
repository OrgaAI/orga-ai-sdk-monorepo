import type { WidgetBranding } from "../config";

// TODO: Add JSDoc comments
const sanitizeAssetUrl = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  // Allow data URIs for inline SVG/PNG, etc.
  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  // Allow same-origin relative paths like "/favicon.ico".
  // These will be resolved by the browser relative to the current origin.
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    // ignore invalid URLs
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[OrgaWidget] Ignoring unsafe asset URL. Only HTTPS URLs, data:image URIs, or absolute paths starting with "/" are allowed. Received: ${trimmed}`
    );
  }

  return undefined;
};

export const sanitizeBranding = (branding: WidgetBranding): WidgetBranding => {
  return {
    ...branding,
    badgeIconUrl: sanitizeAssetUrl(branding.badgeIconUrl),
    logoUrl: sanitizeAssetUrl(branding.logoUrl),
  };
};
