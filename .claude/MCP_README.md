# MCP Server Configuration

This project uses Model Context Protocol (MCP) servers to extend Claude's capabilities.

## Configured Servers

### Browser MCP (@modelcontextprotocol/server-puppeteer)

**Purpose:** Provides browser automation and debugging capabilities through Puppeteer.

**Configuration:** See [.mcp.json](../.mcp.json)

**Tools Available:**
- `mcp__puppeteer_navigate` - Navigate to URLs
- `mcp__puppeteer_screenshot` - Capture screenshots
- `mcp__puppeteer_click` - Click elements
- `mcp__puppeteer_fill` - Fill form inputs
- `mcp__puppeteer_select` - Select dropdown options
- `mcp__puppeteer_hover` - Hover over elements
- `mcp__puppeteer_evaluate` - Execute JavaScript in browser
- `mcp__puppeteer_pdf` - Generate PDFs

**Used By:**
- [debug-browser skill](skills/debug-browser.md)

## Activation

MCP servers are automatically activated when:
1. The `.mcp.json` file exists in the project root
2. Claude Code loads the project
3. The required npm packages are available (installed on first use with `npx -y`)

## Testing MCP Connection

To verify the browser MCP is working:

```
1. Ask Claude to navigate to a URL
2. Request a screenshot
3. Check if browser tools are available
```

Example:
> "Use the browser MCP to navigate to http://localhost:5175 and take a screenshot"

## Related Skills

- **debug-browser** - Interactive browser debugging using MCP
- **debug-localhost** - Automated Playwright testing (complementary)

## Adding New MCP Servers

To add more MCP servers, edit `.mcp.json`:

```json
{
  "mcpServers": {
    "browser": { ... },
    "new-server": {
      "command": "npx",
      "args": ["-y", "@scope/package-name"],
      "env": {}
    }
  }
}
```

## Common Issues

**Issue:** MCP tools not appearing
- **Fix:** Restart Claude Code to reload `.mcp.json`

**Issue:** Puppeteer installation fails
- **Fix:** Run `npx -y @modelcontextprotocol/server-puppeteer` manually

**Issue:** Browser commands timeout
- **Fix:** Check localhost server is running, increase timeout if needed

## Documentation

- [Claude MCP Documentation](https://docs.claude.com/en/docs/claude-code/mcp)
- [Puppeteer MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer)
