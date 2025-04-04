# Sapling MCP Server

A Node.js implementation of Model Context Protocol (MCP) server for Sapling SCM, demonstrating custom tools integration.

## Installation

```bash
npm install @opqr/sapling-mcp
```

## Usage

You can run the MCP server directly using npx:

```bash
npx @opqr/sapling-mcp
```

## Development

For local development:

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Run in development mode:

```bash
npm run dev
```

## Cursor Integration

```json
{
  "mcpServers": {
    "sapling": {
      "command": "npx",
      "args": ["@opqr/sapling-mcp"],
      "type": "command"
    }
  }
}
```

Now you can select "Sapling MCP" as your MCP server in Cursor's AI settings.

## License

MIT
