"use client";

import { fetchSessionConfig } from "@/services/fetchTokenAndServers";
import { OrgaAI, OrgaAIProvider } from "@orga-ai/sdk-web";

OrgaAI.init({
  logLevel: "debug",
  enableTranscriptions: true,
  fetchSessionConfig: fetchSessionConfig,
  voice: "fable",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <OrgaAIProvider>{children}</OrgaAIProvider>;
}
