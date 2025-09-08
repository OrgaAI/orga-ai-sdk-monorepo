# Orga SDK Monorepo

The Orga SDK enables seamless integration of real-time AI-powered audio and video features into your React web or React Native applications.

---

## Monorepo Overview

This monorepo contains the complete Orga SDK ecosystem:

### 📦 Packages (`packages/`)
- **`sdk-web/`** - React web SDK for browser-based applications
- **`sdk-react-native/`** - React Native SDK for mobile applications  
- **`eslint-config/`** - Shared ESLint configurations
- **`typescript-config/`** - Shared TypeScript configurations

### 🚀 Example Applications (`apps/`)
- **`web/`** - Next.js playground for testing the web SDK
- **`mobile/`** - React Native playground for testing the mobile SDK

### 🎯 Purpose
- **SDK Development:** Build and test the Orga AI SDKs
- **Integration Examples:** Demonstrate SDK usage in real applications
- **Internal Testing:** Provide playgrounds for SDK feature testing

---

## Project Overview

- **Purpose:** Add real-time audio and video interaction powered by Orga AI to your app.
- **Supported Platforms:**
  - React Web (with React context)
  - React Native (mobile)
- **Audience:**
  - Internal developers, partners, and customers with a valid Orga platform account and API key.
  - Not free to use; requires an active subscription and API key.
  - Used internally for the Orga Playground (web) and mobile app (React Native).

> **Internal Use Only**

This repository contains the Orga SDKs for integrating our real-time AI audio and video features into React web and React Native applications. This README is for internal developers and partners. Please do not share or expose sensitive information.

---

## Prerequisites

- **Node.js:** v18 or higher (see `package.json` for current minimum)
- **pnpm:** Used for monorepo and dependency management (install globally if needed)
- **bun:** Required for the example applications
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

Install the SDK from npm. Choose the appropriate package and version based on your needs:

### Package Selection
- **`@orga-ai/sdk-web`** - For React web applications
- **`@orga-ai/react-native`** - For React Native mobile applications

### Version Types

#### Latest Stable Release
```sh
# Web SDK
npm install @orga-ai/sdk-web

# React Native SDK  
npm install @orga-ai/react-native
```

#### Alpha/Beta Releases
```sh
# Web SDK alpha
npm install @orga-ai/sdk-web@alpha

# React Native SDK beta
npm install @orga-ai/react-native@beta
```

#### Specific Test Versions
```sh
# Web SDK test version
npm install @orga-ai/sdk-web@0.0.0-test.1

# React Native SDK test version
npm install @orga-ai/react-native@0.0.0-test.5
```

#### Specific Alpha/Beta Versions
```sh
# Web SDK specific alpha version
npm install @orga-ai/sdk-web@0.0.0-alpha.2

# React Native SDK specific beta version
npm install @orga-ai/react-native@0.0.0-beta.3
```

### Package Managers
You can use `npm`, `pnpm`, or `bun` to install the SDK:
```sh
npm install @orga-ai/sdk-web
pnpm add @orga-ai/sdk-web
bun add @orga-ai/sdk-web
```

> **Note:** Make sure your `.npmrc` is configured for private package access if using test/alpha versions.

---

## Initialization & Minimal Usage

### 1. Initialize the SDK

You **must** initialize the SDK before use, providing a `fetchSessionConfig` function. This function is responsible for securely fetching an ephemeral token and ICE servers from your backend using your API key.

**Do not expose your API key in client code.**

#### Example (Web or React Native)

```ts
import { OrgaAI } from '@orga-ai/sdk-web'; // or '@orga-ai/react-native'

OrgaAI.init({
  logLevel: 'debug',
  fetchSessionConfig: async () => {
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
import { OrgaAIProvider } from '@orga-ai/sdk-web'; // or '@orga-ai/react-native'

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
import { useOrgaAI } from '@orga-ai/sdk-web'; // or '@orga-ai/react-native'

function MyComponent() {
  const {
    startSession,
    endSession,
    toggleCamera,
    toggleMic
    // ...other methods and state
  } = useOrgaAI();

  // ...
}
```

> **Note:** For Next.js or SSR projects, ensure the provider and hooks are only used in client components.

---

## Configuration

- **API Key:** Required for backend endpoint that provides ephemeral tokens. Never expose in client code.
- **fetchSessionConfig:**
  - Signature: `() => Promise<{ ephemeralToken: string; iceServers: RTCIceServer[] }>`
  - Must be provided to `OrgaAI.init`.
- **Other Config Options:** See SDK source for available options (logLevel, model, etc.).

---

## Development & Testing

### Working with the Monorepo

The monorepo structure allows for efficient SDK development and testing:

1. **SDK Development:**
   ```bash
   cd packages/sdk-web          # or sdk-react-native
   bun run build               # Build the SDK
   ```

2. **Testing in Example Apps:**
   ```bash
   cd apps/web                 # or apps/mobile
   bun install                 # Install dependencies
   bun run dev                 # or `bunx expo -c` to start development server
   ```

### Example Applications

- **Web App (`apps/web/`):** Next.js playground for testing web SDK features
  - Real-time video/audio streaming
  - SDK integration examples
  - UI components for testing

- **Mobile App (`apps/mobile/`):** React Native playground for testing mobile SDK
  - Camera and audio controls
  - Transcription features
  - Native device integration

### Development Workflow

- **Install from npm** for normal usage and integration.
- **Internal SDK development:** Use the mobile or web example applications to easily test SDK changes.
1. `cd packages/sdk-web` or `cd packages/sdk-react-native`
2. After making changes: `bun run build`  
3. `cd apps/web` or `cd apps/mobile`
4. `bun install` incase of any added packages.
5. Test.

Given the monorepo structure, with the example applications we are able to look to the built sdk locally. This removes the need for publishing to npm private every time we make changes.

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

---

## Support & Contact

- **General/Monorepo:** Contact Austin (project lead) via Pumble or Jira
- **Web SDK:** Contact Fran (WebSDK lead)
- Use Jira for tickets (please specify which SDK and describe the issue clearly)


---

## API Reference

Full API documentation and usage examples coming soon.

---

## License

Proprietary. All rights reserved.