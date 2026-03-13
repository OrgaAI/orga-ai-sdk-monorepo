Run the FastMCP demo server
===========================

This example shows how to run a custom MCP server using Python and [FastMCP](https://pypi.org/project/fastmcp/). It matches the `mcp_server.py` file in this directory and is ready to be connected to Orga via `mcpServer`.

> You can either:
> - Use this example as-is, or
> - Follow the same steps in your own project directory.

---

1. Create a project and install FastMCP
---------------------------------------

If you’re starting from scratch, create a new project directory and set up a virtual environment:

```bash
mkdir mcp-demo && cd mcp-demo
python3 -m venv .venv
source .venv/bin/activate
pip install fastmcp
```

On Windows, activate the virtual environment with:

```bash
.venv\Scripts\activate
```

In this repo, the example `mcp_server.py` is already created at `examples/mcp/fast-mcp/mcp_server.py`, so you can focus on running it. The core pattern looks like this:

```python
import os
from datetime import datetime
from fastmcp import FastMCP

mcp = FastMCP("Demo Tools")

@mcp.tool(name="get_time", description="Returns the current time in ISO 8601 format")
def get_time() -> str:
    return datetime.now().isoformat()

@mcp.tool(name="echo", description="Echo back the given message")
def echo(message: str) -> str:
    return message

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    mcp.run(transport="http", host="0.0.0.0", port=port)
```

Each `@mcp.tool` decorator registers a tool with a name, description, and a parameter schema inferred from the function signature.

---

2. Run the server
-----------------

From the `examples/mcp/fast-mcp` directory (with your virtual environment activated if you’re using one), run:

```bash
python mcp_server.py
```

The server listens on port `8000` by default. You can override the port:

```bash
PORT=5000 python mcp_server.py
```

FastMCP exposes the MCP endpoint at:

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
- That your FastMCP server is still running without errors.
