export const readmeContent = `# Orga AI Next.js Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [@orga-ai/create-orga-next-app](https://github.com/orga-ai/orga-next-cli) and pre-configured with the Orga AI SDK.

## About Orga AI

Orga AI SDK is a powerful toolkit for building AI-powered applications with real-time video and audio capabilities. This project includes everything you need to get started with Orga AI SDK in your Next.js application.

## What's Included

This project comes pre-configured with:

- **Orga AI SDKs**
  - \`@orga-ai/react\` - React hooks and components for Orga AI
  - \`@orga-ai/node\` - Node.js SDK for server-side operations

- **UI Components** (ShadCN UI)
  - Button, Label, Select, Slider, Textarea
  - Fully styled with Tailwind CSS

- **Pre-configured Setup**
  - Orga AI provider configured in \`app/providers/OrgaProvider.tsx\`
  - API route handler in \`app/api/route.ts\`
  - Example playground page showcasing Orga AI features
  - Environment configuration template

## Getting Started

First, make sure you have your Orga AI credentials configured:

1. Copy \`.env.local\` and add your Orga AI API keys:
   \`\`\`bash
   # Your Orga AI configuration
   ORGAAI_API_KEY=your_token_here
   \`\`\`

2. Install dependencies (if not already done):
   \`\`\`bash
   npm install
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the Orga AI Playground.

## Project Structure

\`\`\`
app/
  ├── api/
  │   └── route.ts          # Orga AI API route handler
  ├── providers/
  │   └── OrgaProvider.tsx  # Orga AI React provider
  ├── layout.tsx            # Root layout with OrgaProvider
  └── page.tsx              # Orga AI Playground example
\`\`\`

## Using Orga AI in Your App

### Basic Setup

The Orga AI provider is already configured in your root layout. You can use the \`useOrgaAI\` hook in any client component:

\`\`\`tsx
"use client";
import { useOrgaAI } from "@orga-ai/react";

export default function MyComponent() {
  const { startSession, endSession, connectionState } = useOrgaAI();
  
  return (
    <div>
      <button onClick={startSession}>Start Session</button>
      <button onClick={endSession}>End Session</button>
      <p>Status: {connectionState}</p>
    </div>
  );
}
\`\`\`

### Video and Audio

The playground example (\`app/page.tsx\`) demonstrates:
- Video streaming with camera controls
- Audio streaming with microphone controls
- Real-time AI conversation
- Model and voice selection
- Temperature adjustment
- Conversation history

## Learn More

- [Orga AI Documentation](https://docs.orga-ai.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [ShadCN UI Components](https://ui.shadcn.com)

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Make sure to add your \`ORGAAI_API_KEY\` environment variable in your deployment settings.

## Support

For issues and questions:
- Check the [Orga AI Documentation](https://docs.orga-ai.com)
`;

