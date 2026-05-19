#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook: runs ESLint on the edited file.
 * Receives JSON on stdin with tool_input.file_path or tool_response.filePath.
 * Detects whether the file is in Client/ or Server/ and runs the correct ESLint.
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

    // Normalize to forward slashes for comparison
    const normalized = filePath.replace(/\\/g, "/");

    let cwd;
    if (normalized.includes("/Client/")) {
      cwd = path.join(projectRoot, "Client");
    } else if (normalized.includes("/Server/")) {
      cwd = path.join(projectRoot, "Server");
    } else {
      // File outside Client/Server — skip
      process.exit(0);
    }

    execSync(`npx eslint --no-error-on-unmatched-pattern "${filePath}"`, {
      cwd,
      stdio: "inherit",
      timeout: 25000,
      shell: process.platform === "win32" ? "bash" : "/bin/sh",
    });
  } catch (e) {
    // Don't block Claude on lint errors — they're visible in output
    if (e.status) process.exit(0);
  }
});
