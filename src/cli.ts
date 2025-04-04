#!/usr/bin/env node

import { McpServer } from "./mcp-server.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main(): Promise<void> {
  try {
    const transport = new StdioServerTransport();
    await McpServer.connect(transport);
    console.log("MCP Server started successfully");
  } catch (error) {
    console.error("Failed to start MCP Server:", error);
    process.exit(1);
  }
}

main();
