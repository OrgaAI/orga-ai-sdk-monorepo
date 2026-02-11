"use client";

import { fetchSessionConfig } from "@/services/fetchTokenAndServers";
import { OrgaAI, OrgaAIProvider } from "@orga-ai/react";

OrgaAI.init({
  logLevel: "disabled",
  enableTranscriptions: true,
  fetchSessionConfig: fetchSessionConfig,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <OrgaAIProvider>{children}</OrgaAIProvider>;
}
