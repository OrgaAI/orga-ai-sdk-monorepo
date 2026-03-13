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