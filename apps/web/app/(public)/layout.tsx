'use client'

import { OrgaAI, OrgaAIProvider } from "@orga-ai/sdk-web";
import { fetchEphemeralTokenAndIceServers } from "@/services/fetchTokenAndServers";

OrgaAI.init({
  logLevel: "debug",
  enableTranscriptions: true,
  fetchEphemeralTokenAndIceServers: fetchEphemeralTokenAndIceServers,
  // model: "orga-1-beta",
  // voice: "coral",
  // temperature: 0.5,
  // maxTokens: 1000,
  // modalities: ["audio", "video"],
})

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <OrgaAIProvider>
      {children}
    </OrgaAIProvider>
  );
}
