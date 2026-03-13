"use client";

import { fetchSessionConfig } from "@/services/fetchTokenAndServers";
import { OrgaAI, OrgaAIProvider } from "@orga-ai/react";

OrgaAI.init({
  logLevel: "debug",
  enableTranscriptions: true,
  fetchSessionConfig: fetchSessionConfig,
  baseUrl: "https://dev.orga-ai.com",
  mcpServer: {
    id: "orga-ai-mcp-server",
    alias: "Calculator & Time",
    url: "https://a380-84-126-42-0.ngrok-free.app/mcp"
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <OrgaAIProvider>{children}</OrgaAIProvider>;
}
