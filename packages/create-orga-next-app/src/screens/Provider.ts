export const providerContent = `"use client";

import { OrgaAI, OrgaAIProvider } from "@orga-ai/react";

OrgaAI.init({
  logLevel: "disabled",
  enableTranscriptions: true,
   fetchSessionConfig: async () => {
    const response = await fetch('/api');
    if (!response.ok) {
      throw new Error('Failed to fetch session config');
    }
    return response.json();
  },
  voice: "fable",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <OrgaAIProvider>{children}</OrgaAIProvider>;
}`;