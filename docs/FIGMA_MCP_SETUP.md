# Figma MCP Setup

This guide adds a Figma MCP server to your workspace so AI coding tools can fetch design context from Figma and generate accurate code.

## Requirements
- Windows with PowerShell
- Node.js and npm installed (`node -v`, `npm -v`)
- A Figma API access token

## Get your Figma API token
- Create a Personal Access Token in Figma (Account → Settings → Security → Personal access tokens).
- Store it securely and do not commit it to the repo.

## Add environment variable
- Add to the project `.env` file (or use your shell):
```
FIGMA_API_KEY=your_figma_api_key
```
- Already added to `.env.example` for discoverability.

## Start the local MCP server (community CLI)
We use the `figma-developer-mcp` server via an included script.

Run:
```
powershell -ExecutionPolicy Bypass -File tools\mcp-figma\start.ps1 -FigmaApiKey "<YOUR_TOKEN>"
```
Optional port:
```
powershell -ExecutionPolicy Bypass -File tools\mcp-figma\start.ps1 -FigmaApiKey "<YOUR_TOKEN>" -Port 3333
```
This starts the server in stdio mode for IDE integration.
## Integrate with your editor

Example MCP client config using env:
```
{
  "mcpServers": {
    "Framelink Figma MCP": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--stdio"],
      "env": { "FIGMA_API_KEY": "YOUR-KEY" }
    }
  }
}
```
Windows alternative using explicit args:
```
{
  "mcpServers": {
    "Framelink Figma MCP": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "figma-developer-mcp", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

## Figma Desktop MCP server (official)
- Enable in Figma Desktop: Dev Mode → Inspect panel → "Enable desktop MCP server".
- Local address: `http://127.0.0.1:3845/mcp`.
- Many editors support connecting to the local or remote server (`https://mcp.figma.com/mcp`).
## Troubleshooting
- `npx` not found: Install Node.js (includes npm) and re-open terminal.
- Permission policy: use `-ExecutionPolicy Bypass` when running PowerShell scripts.
- Token errors: confirm `FIGMA_API_KEY` is correct and has read access.
- Proxy/firewall: ensure npm/npx can fetch packages and your port is open.
- Port conflicts: supply `-Port` to run on a different port.

## References
- [figma-developer-mcp – npm](https://www.npmjs.com/package/figma-developer-mcp)
- [Figma Help Center: Guide to the MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server)
- [@hapins/figma-mcp – npm](https://www.npmjs.com/package/@hapins/figma-mcp)
- [TimHolden/figma-mcp-server – GitHub mirror](https://github.com/MCP-Mirror/TimHolden_figma-mcp-server)
