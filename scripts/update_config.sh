#!/bin/bash

# Get the absolute path of node
NODE_PATH=$(which node)

# Get the absolute path of the project directory
PROJECT_DIR=$(pwd)

# Update the mcp.json file with the correct paths
sed -i '' "s|\"command\": \".*\"|\"command\": \"$NODE_PATH\"|" .cursor/mcp.json
sed -i '' "s|\"args\": \[\".*\"\]|\"args\": [\"$PROJECT_DIR/dist/mcp-server.js\"]|" .cursor/mcp.json

echo "Configuration updated successfully!" 