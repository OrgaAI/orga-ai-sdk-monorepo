Run the Node MCP demo server
============================

This example shows how to run a custom MCP server using Node, Express, and the official `@modelcontextprotocol/sdk`. It matches the `server.ts` file in this directory and is ready to be connected to Orga via `mcpServer`.

> You can either:
> - Use this example as-is, or
> - Follow the same steps in your own project directory.

---

1. Create a project and install dependencies
--------------------------------------------

If you’re starting from scratch, create a new project and install the MCP + HTTP dependencies:

```bash
mkdir mcp-demo && cd mcp-demo
npm init -y
npm install @modelcontextprotocol/sdk express cors zod
npm install -D typescript tsx @types/node @types/express @types/cors
```

In this repo, the example `server.ts` is already created in `examples/mcp/node/server.ts`, so you can focus on running it. The code looks like this in your own project:

```ts
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
```

---

2. Run the server
-----------------

From the `examples/mcp/node` directory, run:

```bash
npx tsx server.ts
```

The server listens on port `8000` by default. You can override the port:

```bash
PORT=5000 npx tsx server.ts
```

The MCP endpoint is exposed at:

- `http://localhost:8000/mcp` (or `http://localhost:<PORT>/mcp` if you override the port)

---

3. Confirm the endpoint is reachable
------------------------------------

With the server running, verify that the MCP endpoint responds to `initialize`:

```bash
curl -X POST http://localhost:8000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1,"params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'
```

You should get a JSON response with `"result"` describing the server’s capabilities, and an `mcp-session-id` header. If you see “Connection refused”, make sure:

- The server is running.
- You are using the correct port.

---

4. Expose your MCP server with a tunnel
---------------------------------------

Orga connects to the MCP server from `api.orga-ai.com`, not from your browser. The URL you pass to `mcpServer` must be publicly reachable — `localhost` will not work.

Use a tunnel like ngrok or Cloudflare Tunnel to expose your local server:

```bash
ngrok http 8000
```

Copy the public URL (for example: `https://abc123.ngrok-free.app`).

---

5. Connect the MCP server in your Orga session config
-----------------------------------------------------

Pass `mcpServer` in the config object you give to `OrgaAI.init()`. Use your tunnel URL (not `localhost`). The SDK sends it to the realtime API as `mcp_server` when you start a session.

```ts
OrgaAI.init({
  // ...your existing init options (fetchSessionConfig, model, voice, etc.)...
  mcpServer: {
    id: "demo",
    alias: "Demo Tools",
    url: "https://abc123.ngrok-free.app/mcp", // your tunnel URL + /mcp
  },
});
```

Replace `abc123.ngrok-free.app` with your actual ngrok URL. The URL usually changes each time you restart ngrok (unless you have a static domain).

---

6. Test the connection from Orga
--------------------------------

1. Start your Orga AI app and initiate a session.
2. When the session connects, check the ngrok terminal — you should see `POST /mcp` requests coming from Orga’s backend. This confirms the connection is working.
3. Ask the assistant something that should trigger one of your tools:

   - **`get_time` tool**: “What time is it?”
   - **`echo` tool**: “Echo back: hello world”

If the assistant uses the tools and responds correctly, your MCP server is working end-to-end. If not, double-check:

- That the tunnel is running.
- That the URL in `mcpServer.url` is correct (including `/mcp`).
- That your Node server is still running without errors.
