"use client";

import { fetchEphemeralTokenAndIceServers } from "@/services/fetchTokenAndServers";
import { OrgaAI, OrgaAIProvider } from "@orga-ai/sdk-web";

OrgaAI.init({
  logLevel: "debug",
  enableTranscriptions: true,
  fetchEphemeralTokenAndIceServers: fetchEphemeralTokenAndIceServers,
  voice: "fable",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <OrgaAIProvider>{children}</OrgaAIProvider>;
}
