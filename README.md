# Orga SDK Monorepo ![License: Apache-2.0](https://img.shields.io/badge/license-Apache%202.0-blue.svg)

Build voice-forward, real-time audio/video experiences with Orga AI. This monorepo contains the TypeScript core, web & mobile SDKs, server helpers, and playground apps used across production deployments.

## Highlights
- **Shared core** abstracts transports, auth, and models so React and React Native stay thin.
- **Real-time optimized** WebRTC transport with media + data channels, adaptive retries, and telemetry.
- **Full-stack coverage**: client SDKs, server SDKs, example apps, and lint/TS config in one place.
- **Docs-first** workflow at [docs.orga-ai.com](https://docs.orga-ai.com) with MDX recipes and API references.

## Table of contents
- [Documentation](#documentation)
- [Project layout](#project-layout)
- [SDKs & tools](#sdks--tools)
- [Getting started](#getting-started)
- [Contributing](#contributing)
- [FAQ & support](#faq--support)
- [License](#license)

## Documentation
Learn more about every SDK, guide, and API surface in the public docs: **[docs.orga-ai.com](https://docs.orga-ai.com)**.

## Project layout
```
packages/
  client/              # Core + React + React Native adapters (shared logic & UI bindings)
  server/              # Node & Python server SDKs for token exchange + orchestration
  create-orga-next-app/# CLI to scaffold Next.js projects with Orga AI pre-configured
  eslint-config/       # Shared lint rules
  typescript-config/   # TS project references + presets
examples/
  next/                # Next.js playground (browser)
  expo-app/            # Expo / React Native playground
  python-backend/      # FastAPI example for session config + tokens
```

- `pnpm` manages workspaces, builds, and dependency hoisting.
- `turborepo` (via `turbo.json`) coordinates multi-package tasks.
- TypeScript project references keep builds fast and reproducible.

## SDKs & tools

### Client SDKs
| Package | Description | Status | Documentation |
| --- | --- | --- | --- |
| `@orga-ai/core` | Platform-neutral client with transports, auth, events, and typed models. | Beta | [Core overview](https://docs.orga-ai.com/docs/client-sdks/core/introduction) |
| `@orga-ai/react` | React provider + hooks (`OrgaAIProvider`, `useOrgaAI`, etc.) layered on top of core. | Beta | [React docs](https://docs.orga-ai.com/docs/client-sdks/react/introduction) |
| `@orga-ai/react-native` | React Native adapter with native media shims and lifecycle helpers. | Beta | [React Native docs](https://docs.orga-ai.com/docs/client-sdks/react-native/introduction) |

### Server SDKs
| Package | Description | Status | Documentation |
| --- | --- | --- | --- |
| `@orga-ai/server-node` | Node.js helper for issuing ephemeral session tokens and orchestrating sessions. | Beta | [Node server docs](https://docs.orga-ai.com/docs/server-sdks/node/introduction) |
| `orga-ai-server` (PyPI) | Python helper (FastAPI-ready) for token exchange endpoints and admin flows. | In development | - |

### CLI Tools
| Package | Description | Status | Documentation |
| --- | --- | --- | --- |
| `@orga-ai/create-orga-next-app` | CLI to scaffold Next.js projects with Orga AI SDKs, ShadCN UI, and pre-configured setup. | Stable | [README](packages/create-orga-next-app/README.md) |

### Example apps & tooling
- **`examples/next`**: Next.js playground with UI controls, transcription feed, and device settings.
- **`examples/expo-app`**: Expo project showcasing voice controls, reconnect flows, and DataChannel events.
- **`examples/python-backend`**: FastAPI reference backend that exchanges API keys for ephemeral session tokens.
- **Shared configs** (`eslint-config`, `typescript-config`) keep linting and typing consistent across packages.

## Getting started
Use these steps to work with the monorepo locally or integrate the Orga SDKs into your own app.

### Quick start with CLI (recommended)
The fastest way to get started is using our CLI to scaffold a fully configured Next.js project:
```sh
npx @orga-ai/create-orga-next-app my-app
cd my-app
npm run dev
```
This creates a Next.js project with Orga AI SDKs, ShadCN UI components, and a pre-built playground page. See the [create-orga-next-app README](packages/create-orga-next-app/README.md) for more options.

### 1. Prerequisites
- Node.js 18+
- `pnpm` (workspace + dependency management)
- Orga API key from [platform.orga-ai.com](https://platform.orga-ai.com) (create a project → generate API key)

### 2. Install an SDK (or build locally)
```sh
# React
pnpm add @orga-ai/react

# React Native
pnpm add @orga-ai/react-native

# Node 
pnpm add @orga-ai/node
```

### 3. Configure secure session creation
1. Use your own backend to call the Orga Platform with your **API key** from `platform.orga-ai.com`.
2. Return an ephemeral token + ICE servers to the client (see `examples/python-backend` for a template).
3. Initialize the SDK with a `fetchSessionConfig` that calls your backend:

```ts
import { OrgaAI } from '@orga-ai/react';

OrgaAI.init({
  fetchSessionConfig: async () => {
    const res = await fetch('/api/orga/session');
    const { ephemeralToken, iceServers } = await res.json();
    return { ephemeralToken, iceServers };
  },
});
```

### 4. Explore the playgrounds (using locally built packages)
- `pnpm dev --filter examples/next` launches the Next.js playground using the local `@orga-ai/react` build.
- `pnpm dev --filter examples/expo-app` starts the Expo app backed by the local `@orga-ai/react-native` build (simulator or device required).

For deeper architecture notes and lifecycle diagrams, see the **Architecture** sections at [docs.orga-ai.com](https://docs.orga-ai.com).

## Contributing
1. **Discuss** – open an issue for bugs, feature requests, or documentation gaps.
2. **Fork & branch** – use feature branches (`feat/my-update`) against `dev`.
3. **Tests & lint** – run `pnpm lint` and relevant package tests before submitting.
4. **Pull request** – fill out the PR template, link related issues, and describe testing.

## FAQ & support
- **Docs & recipes:** [docs.orga-ai.com](https://docs.orga-ai.com)
- **Community chat:** Join the [Orga AI Discord](https://discord.gg/8WJ8CEt8).
- **Updates:** Follow [@orgaai on X](https://x.com/orgaai) for release notes.
- **Issues:** Use GitHub Issues for bugs or feature requests; include logs + repro details.
- **Security:** Report sensitive vulnerabilities privately at `security@orga-ai.com`.

## License
Released under the [Apache License 2.0](LICENSE). Contributions are accepted under the same license unless stated otherwise.