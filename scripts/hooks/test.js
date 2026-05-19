#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook: runs Vitest when a test file is edited.
 * Receives JSON on stdin with tool_input.file_path or tool_response.filePath.
 * Only runs if the file contains ".test." in its name.
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const json = JSON.parse(input);
    const filePath =
      json.tool_input?.file_path || json.tool_response?.filePath || "";

    if (!filePath) process.exit(0);

    const normalized = filePath.replace(/\\/g, "/");
    const fileName = path.basename(normalized);

    // Only run for test files
    if (!fileName.includes(".test.")) process.exit(0);

    let cwd;
    if (normalized.includes("/Client/")) {
      cwd = path.join(projectRoot, "Client");
    } else if (normalized.includes("/Server/")) {
      cwd = path.join(projectRoot, "Server");
    } else {
      process.exit(0);
    }

    execSync("npx vitest run --reporter=verbose --passWithNoTests", {
      cwd,
      stdio: "inherit",
      timeout: 60000,
      shell: process.platform === "win32" ? "bash" : "/bin/sh",
    });
  } catch (e) {
    // Don't block Claude — test failures are visible in output
    if (e.status) process.exit(0);
  }
});
