import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { spawn } from "child_process";

// Schema definitions using Zod
const SaplingStatus = z.object({
  repoPath: z.string(),
});

const SaplingDiffUnstaged = z.object({
  repoPath: z.string(),
});

const SaplingDiffStaged = z.object({
  repoPath: z.string(),
});

const SaplingDiff = z.object({
  repoPath: z.string(),
  target: z.string(),
});

const SaplingCommit = z.object({
  repoPath: z.string(),
  message: z.string(),
  files: z.array(z.string()).optional(),
});

const SaplingAdd = z.object({
  repoPath: z.string(),
  untrackedFiles: z.array(z.string()),
});

const SaplingRevert = z.object({
  repoPath: z.string(),
});

const SaplingLog = z.object({
  repoPath: z.string(),
  maxCount: z.number().default(10),
});

const SaplingBook = z.object({
  repoPath: z.string(),
  bookmarkName: z.string(),
});

const SaplingGoto = z.object({
  repoPath: z.string(),
  target: z.string(),
});

const SaplingShow = z.object({
  repoPath: z.string(),
  revision: z.string(),
});

const SaplingInit = z.object({
  repoPath: z.string(),
});

const SaplingPush = z.object({
  repoPath: z.string(),
});

const SaplingLand = z.object({
  repoPath: z.string(),
  pullRequestUrl: z.string(),
});

const SaplingPullRequestList = z.object({
  repoPath: z.string(),
});

enum SaplingTools {
  STATUS = "sapling_status",
  DIFF_UNTRACKED = "sapling_diff_untracked",
  DIFF_CHANGED = "sapling_diff_changed",
  DIFF = "sapling_diff_target",
  COMMIT = "sapling_commit",
  ADD_UNTRACKED = "sapling_add_untracked",
  REVERT = "sapling_revert",
  LOG = "sapling_log",
  BOOK = "sapling_book",
  GOTO = "sapling_goto",
  SHOW = "sapling_show",
  INIT = "sapling_init",
  PUSH = "sapling_push",
  LAND = "sapling_land",
  PULL_REQUEST_LIST = "sapling_pull_request_list",
}

// Helper function to run Sapling commands
async function runSaplingCommand(
  repoPath: string,
  ...args: string[]
): Promise<string> {
  console.log(`[DEBUG] Executing Sapling command: sl ${args.join(" ")}`);
  console.log(`[DEBUG] Working directory: ${repoPath}`);

  return new Promise((resolve, reject) => {
    const process = spawn("sl", [...args, "--pager=cat"], {
      cwd: repoPath,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
      console.log(`[DEBUG] stdout: ${data.toString()}`);
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
      console.error(`[DEBUG] stderr: ${data.toString()}`);
    });

    process.on("error", (error) => {
      console.error(`[ERROR] Process error: ${error.message}`);
      reject(new Error(`Process error: ${error.message}`));
    });

    process.on("close", (code) => {
      console.log(`[DEBUG] Process exited with code ${code}`);
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}. Error: ${stderr}`));
      }
    });

    // 타임아웃 설정 추가
    const timeout = setTimeout(() => {
      console.error("[ERROR] Command timed out after 30 seconds");
      process.kill();
      reject(new Error("Command timed out after 30 seconds"));
    }, 30000);

    process.on("exit", () => {
      clearTimeout(timeout);
      console.log("[DEBUG] Process exit event received");
    });
  });
}

// Create an MCP server
const server = new McpServer({
  name: "mcp-sapling",
  version: "1.0.0",
});

// Register all Sapling tools
server.tool(SaplingTools.STATUS, SaplingStatus.shape, async (args) => {
  const result = await runSaplingCommand(args.repoPath, "status");
  return {
    content: [{ type: "text", text: `Repository status:\n${result}` }],
  };
});

server.tool(
  SaplingTools.DIFF_UNTRACKED,
  SaplingDiffUnstaged.shape,
  async (args) => {
    const result = await runSaplingCommand(args.repoPath, "diff", "--unknown");
    return {
      content: [{ type: "text", text: `Unstaged changes:\n${result}` }],
    };
  }
);

server.tool(
  SaplingTools.DIFF_CHANGED,
  SaplingDiffStaged.shape,
  async (args) => {
    const result = await runSaplingCommand(
      args.repoPath,
      "diff",
      "--modified",
      "--added",
      "--removed",
      "--deleted",
      "--copies"
    );
    return {
      content: [{ type: "text", text: `Staged changes:\n${result}` }],
    };
  }
);

server.tool(SaplingTools.DIFF, SaplingDiff.shape, async (args) => {
  const result = await runSaplingCommand(args.repoPath, "diff", args.target);
  return {
    content: [{ type: "text", text: `Diff with ${args.target}:\n${result}` }],
  };
});

server.tool(SaplingTools.COMMIT, SaplingCommit.shape, async (args) => {
  const result = await runSaplingCommand(
    args.repoPath,
    "commit",
    "-m",
    args.message,
    ...(args.files ? args.files : [])
  );
  return {
    content: [{ type: "text", text: result }],
  };
});

server.tool(SaplingTools.ADD_UNTRACKED, SaplingAdd.shape, async (args) => {
  const result = await runSaplingCommand(
    args.repoPath,
    "add",
    ...args.untrackedFiles
  );
  return {
    content: [{ type: "text", text: result }],
  };
});

server.tool(SaplingTools.REVERT, SaplingRevert.shape, async (args) => {
  const result = await runSaplingCommand(args.repoPath, "revert", "--all");
  return {
    content: [{ type: "text", text: result }],
  };
});

server.tool(SaplingTools.LOG, SaplingLog.shape, async (args) => {
  const result = await runSaplingCommand(
    args.repoPath,
    "smartlog",
    "-l",
    args.maxCount.toString()
  );
  return {
    content: [{ type: "text", text: `Commit history:\n${result}` }],
  };
});

server.tool(SaplingTools.BOOK, SaplingBook.shape, async (args) => {
  const result = await runSaplingCommand(
    args.repoPath,
    "bookmark",
    args.bookmarkName
  );
  return {
    content: [{ type: "text", text: result }],
  };
});

server.tool(SaplingTools.GOTO, SaplingGoto.shape, async (args) => {
  const result = await runSaplingCommand(args.repoPath, "goto", args.target);
  return {
    content: [{ type: "text", text: result }],
  };
});

server.tool(SaplingTools.SHOW, SaplingShow.shape, async (args) => {
  const result = await runSaplingCommand(
    args.repoPath,
    "show",
    "-r",
    args.revision
  );
  return {
    content: [{ type: "text", text: result }],
  };
});

server.tool(SaplingTools.INIT, SaplingInit.shape, async (args) => {
  const result = await runSaplingCommand(
    args.repoPath,
    "init",
    "--git",
    args.repoPath
  );
  return {
    content: [{ type: "text", text: result }],
  };
});

server.tool(SaplingTools.PUSH, SaplingPush.shape, async (args) => {
  const result = await runSaplingCommand(args.repoPath, "ghstack", "submit");
  return {
    content: [{ type: "text", text: result }],
  };
});

server.tool(SaplingTools.LAND, SaplingLand.shape, async (args) => {
  const result = await runSaplingCommand(
    args.repoPath,
    "ghstack",
    "land",
    args.pullRequestUrl
  );
  return {
    content: [{ type: "text", text: result }],
  };
});

server.tool(
  SaplingTools.PULL_REQUEST_LIST,
  SaplingPullRequestList.shape,
  async (args) => {
    const result = await runSaplingCommand(args.repoPath, "ghstack", "list");
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

// Export the server instance
export { server as McpServer };
