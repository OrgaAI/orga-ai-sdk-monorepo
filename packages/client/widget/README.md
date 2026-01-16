## Orga AI Widget SDK

TypeScript-first widget SDK for Orga AI. It lets you embed a multimodal voice & video assistant either via:

- **CDN snippet** – drop two `<script>` tags into any site and configure a global `OrgaWidget`.
- **NPM package import** – install `@orga-ai/widget` and call a typed `initWidget` helper from React/TypeScript.

This package is built on top of `@orga-ai/react` and expects you to provide a backend that exchanges your Orga API key for short‑lived session credentials.

---

## Installation (npm / pnpm / yarn)

The widget package is published as `@orga-ai/widget`:

```bash
pnpm add @orga-ai/widget
# or
npm install @orga-ai/widget
# or
yarn add @orga-ai/widget
```

You will also need:

- `@orga-ai/react`
- `@orga-ai/core`

Those are declared as dependencies/peer dependencies of this package.

---

## Backend requirements

The widget never receives your Orga API key directly. Instead, you expose a **backend endpoint** that returns a session configuration object:

```ts
type SessionConfigResponse = {
  ephemeralToken: string;
  iceServers: Array<{
    urls: string | string[];
    username?: string;
    credential?: string;
  }>;
};
```

At minimum, your backend must:

- Hold your Orga API key securely (environment variable or secret store).
- Call Orga to create a session.
- Return `{ ephemeralToken, iceServers }` JSON to the frontend.

You can do this with `@orga-ai/node` or any HTTP client that talks to Orga.

---

## CDN usage

Use this when you want the **simplest integration**: static sites, CMS, marketing pages, or anywhere you can edit HTML and host a tiny backend.

### 1. Include the widget bundle

Add the CDN script to your page (replace the URL with your actual CDN endpoint if different):

```html
<!-- Load the Orga AI widget from the CDN -->
<script src="https://widget-test-inky-one.vercel.app/init.global.js" async></script>
```

### 2. Initialize the widget

After the CDN script loads, a global `OrgaWidget` object is available on `window`. Call `OrgaWidget.initWidget` with your configuration:

```html
<script>
  OrgaWidget.initWidget({
    // Required: fetch session credentials from your backend
    fetchSessionConfig: () =>
      fetch("https://your-backend.example.com/api/orga-session").then((res) =>
        res.json(),
      ),

    // Optional: label for logging / error messages
    sessionConfigEndpoint: "https://your-backend.example.com/api/orga-session",

    // Optional: override default voice and logging
    voice: "fable",
    logLevel: "info",

    // Optional: layout & UI configuration (see full table below)
    theme: "floating-badge",
    transcript: "panel",
    videoPreview: "optional",
    branding: {
      brandName: "Orga Assistant",
      tagline: "Your realtime copilot",
      accentColor: "#2D9FBC",
    },
  });
</script>
```

### 3. Add a mount point

By default, the widget will mount into the first element that matches `[data-orga-widget]`. Add that to your HTML where you want the widget shell to live:

```html
<div data-orga-widget></div>
```

You can also pass a specific target (selector or element) via `initWidget({ target })`.

---

## React / Next.js usage (import)

Use this when you want full **TypeScript tooling and React integration**. The API is the same as the CDN global but imported from the package.

### 1. Import and initialize

In a React/Next.js app, create a small client component that calls `initWidget` once on mount:

```tsx
"use client";

import { useEffect } from "react";
import { initWidget, type WidgetInitOptions } from "@orga-ai/widget";

export const OrgaWidgetClient = (): JSX.Element => {
  useEffect(() => {
    const options: WidgetInitOptions = {
      fetchSessionConfig: () =>
        fetch("/api/orga-session").then((res) => res.json()),
      theme: "floating-badge",
      transcript: "panel",
      videoPreview: "optional",
      branding: {
        brandName: "Orga Assistant",
        tagline: "Your realtime copilot",
      },
    };

    initWidget(options);
  }, []);

  return <div data-orga-widget />;
};
```

### 2. Add it to your layout for global availability

In the Next.js App Router, render the widget once in your root layout so it persists across client‑side navigation:

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { OrgaWidgetClient } from "./components/OrgaWidgetClient";

export const metadata: Metadata = {
  title: "Orga AI Widget Example",
  description: "Demo of the @orga-ai/widget SDK",
};

export default function RootLayout(props: { children: React.ReactNode }): JSX.Element {
  const { children } = props;

  return (
    <html lang="en">
      <body>
        {children}
        <OrgaWidgetClient />
      </body>
    </html>
  );
}
```

### 3. Use client‑side navigation to preserve sessions

Because the widget and session are tied to the current page, full reloads will reset them. In Next.js, use `next/link` rather than raw `<a>` tags to navigate without tearing down the layout:

```tsx
"use client";

import Link from "next/link";

export const PageLinks = (): JSX.Element => {
  return (
    <div className="flex gap-4">
      <Link href="/test" className="btn">
        Test Page
      </Link>
      <Link href="/another" className="btn">
        Another Page
      </Link>
    </div>
  );
};
```

As long as `OrgaWidgetClient` lives in a layout that does not unmount during navigation, the widget can keep an active session while the user browses the app.

---

## `initWidget` API reference

The main entry point for both CDN and import usage is:

```ts
initWidget(options: WidgetInitOptions): void;
```

### `WidgetInitOptions`

```ts
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
```

### Options table

| Option                  | Type                                                | Required | Default                 | Description |
| ----------------------- | --------------------------------------------------- | -------- | ----------------------- | ----------- |
| `target`                | `HTMLElement \| string`                             | No       | First `[data-orga-widget]` | DOM element or CSS selector where the widget shell is mounted. |
| `fetchSessionConfig`    | `() => Promise<SessionConfigResponse>`             | **Yes**  | –                       | Async function that calls your backend and returns `{ ephemeralToken, iceServers }`. |
| `sessionConfigEndpoint` | `string`                                           | No       | `undefined`             | Human‑readable endpoint label for logging and error messages. |
| `voice`                 | `OrgaAIVoice`                                      | No       | `"fable"`               | Default voice/model to use for the session. |
| `logLevel`              | `"disabled" \| "error" \| "warn" \| "info" \| "debug"` | No  | `"info"`                | Controls internal logging verbosity. |
| `theme`                 | `WidgetThemeName`                                 | No       | `"floating-badge"`      | Layout preset for the widget shell. |
| `transcript`            | `TranscriptMode`                                  | No       | `"panel"`               | Whether to show the transcript panel. |
| `videoPreview`          | `VideoPreviewMode`                                | No       | `"optional"`            | Controls camera preview and toggle behavior. |
| `branding`              | `Partial<WidgetBranding>`                         | No       | See below               | Branding configuration (merged with safe defaults). |

---

## UI configuration (theme, transcript, video, branding)

```ts
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
```

### Defaults

At runtime, the widget merges your visual options with safe defaults:

```ts
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
};

// theme default:
const defaultTheme: WidgetThemeName = "floating-badge";
```

### UI options table

#### `theme`

| Value             | Description |
| ----------------- | ----------- |
| `"floating-badge"` | Widget appears as a docked badge in the corner that expands into a panel. |
| `"panel"`         | Widget renders as a panel at the point where you place the host element. |
| `"full"`          | Large, full‑panel experience intended for dedicated assistant pages. |

#### `branding`

All `branding` fields are optional when passed via `branding`; they are merged with `DEFAULT_BRANDING` and sanitized.

| Field                 | Type     | Default                  | Notes |
| --------------------- | -------- | ------------------------ | ----- |
| `brandName`           | `string` | `"Orga Assistant"`       | Product or company name shown in the header. |
| `tagline`             | `string` | `"Your realtime copilot"` | Short subtitle beneath the brand name. |
| `accentColor`         | `string` | `"#2D9FBC"`              | Main accent color used for buttons and badge. |
| `backgroundColor`     | `string` | `"#ffffff"`              | Widget body background. |
| `borderColor`         | `string` | `"#e2e8f0"`              | Border color for panels and transcript boxes. |
| `textColor`           | `string` | `"#0f172a"`              | Primary text color. |
| `secondaryTextColor`  | `string` | `"#475569"`              | Secondary / muted text. |
| `badgeIconUrl`        | `string` | Orga logo data URI       | URL or `data:image/*` URI for the floating badge icon. Non‑HTTPS URLs are ignored. |
| `logoUrl`             | `string` | `undefined`              | Optional logo shown in the header. Non‑HTTPS URLs are ignored. |
| `logoAlt`             | `string` | `brandName`              | `alt` text for the header logo. |

#### Visual style guide (status badge & buttons)

The widget exposes a small set of CSS variables so you can align it with your brand while keeping a sensible, accessible default:

- **Colors derived from `branding`**
  - `accentColor` → `--orga-widget-accent` (floating badge background, primary button, user bubbles, “connecting” status).
  - `backgroundColor` → `--orga-widget-bg` (panel and transcript background).
  - `borderColor` → `--orga-widget-border` (panel, transcript, outline buttons).
  - `textColor` → `--orga-widget-primary` (primary text, outline button text).
  - `secondaryTextColor` → `--orga-widget-secondary` (status default text, hints, subtitles).

- **Status badge tokens**
  - `--orga-widget-status-radius` (default `999px`): pill shape for the status chip.
  - `--orga-widget-status-default-bg` / `--orga-widget-status-default-text`: idle/neutral state colors.
  - `--orga-widget-status-connected-bg` / `--orga-widget-status-connected-text`: “Connected” state.
  - `--orga-widget-status-connecting-bg` / `--orga-widget-status-connecting-text`: “Connecting” state that tints toward your `accentColor`.

- **Button tokens**
  - `--orga-widget-control-radius` (default `999px`): shared radius for all CTA buttons.
  - `--orga-widget-button-primary-bg` / `--orga-widget-button-primary-text`: main “Start session” CTA, defaults to your `accentColor` on white text.
  - `--orga-widget-button-danger-bg` / `--orga-widget-button-danger-text`: destructive “Disconnect” CTA, defaults to the error color.
  - `--orga-widget-button-outline-border` / `--orga-widget-button-outline-text`: outline buttons (mic/camera), defaulting to your border/text colors.

In most cases, setting `branding.accentColor`, `branding.backgroundColor`, `branding.borderColor`, and the two text colors is enough to get a cohesive look. Advanced teams can override the CSS variables above in their own stylesheet to further tune badge/button shapes or color ramps while still relying on the same semantic tokens.

#### `features`

| Field          | Type                               | Default     | Description |
| -------------- | ---------------------------------- | ----------- | ----------- |
| `transcript`   | `"hidden"` \| `"panel"`            | `"panel"`   | Whether to show a live transcript panel. |
| `videoPreview` | `"hidden"` \| `"optional"` \| `"always"` | `"optional"` | Controls the camera preview and video toggle button. |

---

## Error handling and safety

The widget wraps your `fetchSessionConfig` with a safety helper that:

- Enforces secure contexts (HTTPS or `localhost`) for media access.
- Applies a timeout and small retry policy.
- Validates that the session config payload contains the required fields.

In case of issues, the user sees clear UI feedback instead of a permanently spinning widget, and the console includes descriptive messages to help you debug misconfigured backends.

---

## Notes

- The CDN usage in plain HTML does **not** provide TypeScript IntelliSense in your editor because it lives outside your TS project.
- For full type safety and autocomplete, prefer the **import usage** (`import { initWidget, type WidgetInitOptions } from "@orga-ai/widget"`) in a TypeScript/React app.
- Both integration styles share the same underlying `initWidget` surface, so you can document them together and migrate between them without changing backend behavior.


