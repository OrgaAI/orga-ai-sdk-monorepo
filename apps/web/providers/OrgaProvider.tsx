"use client";

import { fetchSessionConfig } from "@/services/fetchTokenAndServers";
import { OrgaAI, OrgaAIProvider } from "@orga-ai/react-test";

OrgaAI.init({
  logLevel: "disabled",
  enableTranscriptions: true,
  fetchSessionConfig: fetchSessionConfig,
  voice: "fable",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <OrgaAIProvider>{children}</OrgaAIProvider>;
}
