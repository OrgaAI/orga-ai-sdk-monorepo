'use client'

import { OrgaAI, OrgaAIProvider } from "@orga-ai/sdk-web";
import { fetchEphemeralTokenAndIceServers } from "@/services/fetchTokenAndServers";

OrgaAI.init({
  logLevel: "debug",
  return_transcription: true,
  history: true,
  fetchEphemeralTokenAndIceServers: fetchEphemeralTokenAndIceServers,
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
