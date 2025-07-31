'use client'

import { OrgaAI, OrgaAIProvider } from "orga-ai-sdk";
// import { OrgaAI, OrgaAIProvider } from "orga-ai-web-sdk";
import { fetchEphemeralTokenAndIceServers } from "@/services/fetchTokenAndServers";

OrgaAI.init({

  logLevel: "debug",
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
