import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
 
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
 
const app = express();
app.use(cors());
app.use(express.json());
 
const sessions = new Map<
  string,
  { transport: StreamableHTTPServerTransport; server: McpServer }
>();
 
function isInitializeRequest(body: unknown): boolean {
  if (Array.isArray(body)) {
    return body.some((m) => (m as { method?: string })?.method === "initialize");
  }
  return (body as { method?: string })?.method === "initialize";
}
 
function createServer(): McpServer {
  const server = new McpServer({ name: "demo-mcp-server", version: "1.0.0" });
 
  server.registerTool(
    "get_time",
    { description: "Returns the current time in ISO 8601 format", inputSchema: z.object({}) },
    async () => ({
      content: [{ type: "text", text: new Date().toISOString() }],
    })
  );
 
  server.registerTool(
    "echo",
    {
      description: "Echo back the given message",
      inputSchema: z.object({ message: z.string() }),
    },
    async ({ message }) => ({
      content: [{ type: "text", text: message }],
    })
  );
 
  return server;
}
 
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
 
  try {
    if (sessionId && sessions.has(sessionId)) {
      const { transport } = sessions.get(sessionId)!;
      await transport.handleRequest(req, res, req.body);
      return;
    }
 
    if (!sessionId && isInitializeRequest(req.body)) {
      const server = createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true,
        onsessioninitialized: (id) => {
          sessions.set(id, { transport, server });
        },
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    }
 
    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Bad Request: No valid session ID provided" },
      id: null,
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});
 
app.get("/mcp", (_req, res) => {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    })
  );
});
 
app.listen(PORT, () => {
  console.log(`MCP server running on http://localhost:${PORT}`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});