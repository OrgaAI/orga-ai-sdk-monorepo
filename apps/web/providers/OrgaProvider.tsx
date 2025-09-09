"use client";

import { fetchSessionConfig } from "@/services/fetchTokenAndServers";
import { OrgaAI, OrgaAIProvider } from "@orga-ai/react";

OrgaAI.init({
  logLevel: "debug",
  enableTranscriptions: true,
  fetchSessionConfig: fetchSessionConfig,
  voice: "fable",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <OrgaAIProvider>{children}</OrgaAIProvider>;
}
