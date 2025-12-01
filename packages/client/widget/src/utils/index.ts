import { WidgetBranding, WidgetStyleOverrides } from "../config";
// TODO: Add js doc comments
const sanitizeAssetUrl = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("data:image/")) {
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
      `[OrgaWidget] Ignoring unsafe asset URL. Only HTTPS or data:image URIs are allowed. Received: ${trimmed}`
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

const sanitizeCssVariables = (
  variables: Record<string, string>
): Record<string, string> => {
  const blockedPattern = /(url\(|expression\(|@import|javascript:)/i;
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(variables)) {
    if (!key.startsWith("--")) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[OrgaWidget] Ignoring CSS override "${key}". Custom properties must start with "--".`
        );
      }
      continue;
    }

    if (!value || blockedPattern.test(value)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[OrgaWidget] Ignoring unsafe CSS value for "${key}". Value: "${value}"`
        );
      }
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
};

export const sanitizeOverrides = (
  overrides?: WidgetStyleOverrides
): WidgetStyleOverrides => {
  if (!overrides) {
    return {};
  }

  const sanitized: WidgetStyleOverrides = {
    className: overrides.className,
  };

  if (overrides.cssVariables) {
    sanitized.cssVariables = sanitizeCssVariables(overrides.cssVariables);
  }

  return sanitized;
};
