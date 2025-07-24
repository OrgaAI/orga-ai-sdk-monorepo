# Orga SDK

The Orga SDK enables seamless integration of real-time AI-powered audio and video features into your React web or React Native applications.

---

## Project Overview

- **Purpose:** Add real-time audio and video interaction powered by Orga AI to your app.
- **Supported Platforms:**
  - React Web (with React context)
  - React Native (mobile)
- **Audience:**
  - Developers with an Orga platform account and valid API key.
  - Not free to use; requires an active subscription and API key.

---

## Installation

Install the SDK from npm:

```sh
npm install @orga-ai/sdk-web# Orga SDK Monorepo

> **Internal Use Only**

This repository contains the Orga SDKs for integrating our real-time AI audio and video features into React web and React Native applications. This README is for internal developers and partners. Please do not share or expose sensitive information.

---

## Project Overview

- **Purpose:** Facilitate integration of Orga AI, enabling real-time audio and video interaction in client apps.
- **Supported Platforms:**
  - React Web (with React context, suitable for most React-based web apps)
  - React Native (for mobile apps)
- **Audience:**
  - Internal developers, partners, and customers with a valid Orga platform account and API key.
  - Not free to use; requires an active subscription and API key.
  - Used internally for the Orga Playground (web) and mobile app (React Native).

---

## Prerequisites

- **Node.js:** v18 or higher (see `package.json` for current minimum)
- **pnpm:** Used for monorepo and dependency management (install globally if needed)
- **npm Token:** Required for installing/publishing private packages. See `.npmrc` setup below.
- **API Key:** Obtain from the Orga platform (link to be provided).

### .npmrc Setup

Before installing or publishing, configure your `.npmrc` in the project root:

```ini
@orga-ai:registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```
- Replace `${NPM_TOKEN}` with your actual token or set it as an environment variable.
- **Never commit your real npm token to version control.**

---

## Installation

Install the SDK from npm, specifying the desired tag (e.g., `test`, `alpha`, or a public version):

```sh
npm install @orga-ai/sdk-react-native@0.0.0-test.5
# or
npm install @orga-ai/sdk-web@0.0.0-alpha.2
```
- You can use `npm`, `pnpm`, or `bun` to install the SDK.
- Make sure your `.npmrc` is configured for private package access.

---

## Initialization & Minimal Usage

### 1. Initialize the SDK

You **must** initialize the SDK before use, providing a `fetchEphemeralTokenAndIceServers` function. This function is responsible for securely fetching an ephemeral token and ICE servers from your backend using your API key.

**Do not expose your API key in client code.**

#### Example (Web or React Native)

```ts
import { OrgaAI } from '@orga-ai/sdk-web'; // or '@orga-ai/sdk-react-native'

OrgaAI.init({
  logLevel: 'debug',
  fetchEphemeralTokenAndIceServers: async () => {
    // Call your backend to get ephemeralToken and iceServers
    // Never expose your API key here!
    const response = await fetch('/api/orga-ephemeral');
    const { ephemeralToken, iceServers } = await response.json();
    return { ephemeralToken, iceServers };
  },
});
```

### 2. Wrap Your App with the Provider

```tsx
import { OrgaAIProvider } from '@orga-ai/sdk-web'; // or '@orga-ai/sdk-react-native'

function App() {
  return (
    <OrgaAIProvider>
      {/* ...your app... */}
    </OrgaAIProvider>
  );
}
```

### 3. Use the Hook in Your Components

```tsx
import { useOrgaAI } from '@orga-ai/sdk-web'; // or '@orga-ai/sdk-react-native'

function MyComponent() {
  const {
    startSession,
    endSession,
    videoStream,
    toggleCamera,
    // ...other methods and state
  } = useOrgaAI();

  // ...
}
```

> **Note:** For Next.js or SSR projects, ensure the provider and hooks are only used in client components.

---

## Configuration

- **API Key:** Required for backend endpoint that provides ephemeral tokens. Never expose in client code.
- **fetchEphemeralTokenAndIceServers:**
  - Signature: `() => Promise<{ ephemeralToken: string; iceServers: RTCIceServer[] }>`
  - Must be provided to `OrgaAI.init`.
- **Other Config Options:** See SDK source for available options (logLevel, model, etc.).

---

## Development & Testing

- **Install from npm** for normal usage and integration.
- **Internal SDK development:** Use [`yalc`](https://github.com/wclr/yalc) to test local changes before publishing:
  1. Build the SDK (`pnpm build` in the relevant package)
  2. Run `yalc publish` in the SDK package
  3. In your test app, run `yalc add @orga-ai/sdk-react-native` (or `sdk-web`)
- **Playground/Test App:** (Coming soon) A dedicated app for rapid SDK testing and demos.

---

## Versioning & Publishing

- See internal maintenance docs for detailed workflow.
- Only leads or authorized team members should publish new versions.
- Coordinate with the team before publishing any release (test, alpha, or public).

---

## Known Issues & Future Work

- **Breaking changes are expected** as the SDK evolves in early stages.
- No shared code between web and native SDKs (yet) due to bundling issues.
- Future work:
  - Add shared core logic to reduce duplication
  - Expand documentation and code examples
  - Add automated tests and CI
  - Improve Next.js/SSR support

---

## Support & Contact

- **General/Monorepo:** Contact Austin (project lead) via Pumble or Jira
- **Web SDK:** Contact Fran (WebSDK lead)
- Use Jira for tickets (please specify which SDK and describe the issue clearly)

---

*This README is for internal use only. Do not distribute externally.*

# or
npm install @orga-ai/sdk-react-native
```

---

## Quick Start

### 1. Initialize the SDK

You **must** initialize the SDK before use, providing a `fetchEphemeralTokenAndIceServers` function. This function should securely fetch an ephemeral token and ICE servers from your backend using your API key.

**Never expose your API key in client code.**

```ts
import { OrgaAI } from '@orga-ai/sdk-web'; // or '@orga-ai/sdk-react-native'

OrgaAI.init({
  fetchEphemeralTokenAndIceServers: async () => {
    // Call your backend to get ephemeralToken and iceServers
    const response = await fetch('/api/orga-ephemeral');
    const { ephemeralToken, iceServers } = await response.json();
    return { ephemeralToken, iceServers };
  },
});
```

### 2. Wrap Your App with the Provider

```tsx
import { OrgaAIProvider } from '@orga-ai/sdk-web'; // or '@orga-ai/sdk-react-native'

function App() {
  return (
    <OrgaAIProvider>
      {/* ...your app... */}
    </OrgaAIProvider>
  );
}
```

### 3. Use the Hook in Your Components

```tsx
import { useOrgaAI } from '@orga-ai/sdk-web'; // or '@orga-ai/sdk-react-native'

function MyComponent() {
  const {
    startSession,
    endSession,
    videoStream,
    toggleCamera,
    // ...other methods and state
  } = useOrgaAIContext();

  // ...
}
```

> **Note:** For Next.js or SSR projects, ensure the provider and hooks are only used in client components.

---

## Configuration

- **API Key:** Required for your backend endpoint that provides ephemeral tokens. Never expose in client code.
- **fetchEphemeralTokenAndIceServers:**
  - Signature: `() => Promise<{ ephemeralToken: string; iceServers: RTCIceServer[] }>`
  - Must be provided to `OrgaAI.init`.
- **Other Config Options:** See SDK documentation for available options (logLevel, model, etc.).

---

## Features

- Real-time audio and video streaming
- React context provider and hook-based API
- Easy integration with both web and mobile React apps
- Flexible configuration for custom backend authentication

---

## API Reference

Full API documentation and usage examples coming soon.

---

## Support

For questions or support, please contact your Orga platform representative or support channel.

---

## License

Proprietary. All rights reserved.
