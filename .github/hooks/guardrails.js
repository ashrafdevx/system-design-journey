"use strict";

const path = require("node:path");
const fs = require("node:fs");
const readline = require("node:readline");
const { fileURLToPath } = require("node:url");

const workspaceRoot = path.resolve(__dirname, "../..");
const canonicalWorkspaceRoot = fs.realpathSync(workspaceRoot);
const pathKeys = new Set([
  "path",
  "filepath",
  "file_path",
  "filename",
  "uri",
  "cwd",
  "directory",
  "workingdirectory",
  "targetpath",
]);

function respond(permissionDecision, permissionDecisionReason) {
  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision,
        permissionDecisionReason,
      },
    })}\n`,
  );
}

function isInsideWorkspace(candidate) {
  let resolved = path.resolve(workspaceRoot, candidate);
  const unresolvedParts = [];

  while (true) {
    try {
      resolved = path.join(fs.realpathSync(resolved), ...unresolvedParts.reverse());
      break;
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") {
        throw error;
      }

      const parent = path.dirname(resolved);
      if (parent === resolved) throw error;
      unresolvedParts.push(path.basename(resolved));
      resolved = parent;
    }
  }

  return (
    resolved === canonicalWorkspaceRoot ||
    resolved.startsWith(`${canonicalWorkspaceRoot}${path.sep}`)
  );
}

function isSensitivePath(candidate) {
  const normalized = candidate.startsWith("file://")
    ? fileURLToPath(candidate)
    : candidate;
  const basename = path.basename(normalized).toLowerCase();
  return (
    basename.startsWith(".env") ||
    /\.(pem|p12|pfx|key)$/i.test(basename) ||
    basename === "id_rsa" ||
    basename === "credentials"
  );
}

function findShellPathViolation(value, key = "") {
  if (Array.isArray(value)) {
    for (const item of value) {
      const violation = findShellPathViolation(item, key);
      if (violation) return violation;
    }
    return null;
  }

  if (value && typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) {
      const violation = findShellPathViolation(childValue, childKey);
      if (violation) return violation;
    }
    return null;
  }

  if (typeof value !== "string" || !/^(command|cmd|shellcommand)$/i.test(key)) {
    return null;
  }

  if (/(^|[\s"'=])\.\.(?:[\\/]|$)/.test(value)) {
    return "Shell command contains a parent-directory path outside the application workspace.";
  }

  const absolutePathPattern = /(?:^|[\s="'(])((?:\/|[A-Za-z]:[\\/])[^ \t\r\n"'<>|;&]*)/g;
  for (const match of value.matchAll(absolutePathPattern)) {
    const candidate = match[1].replace(/[),.:]+$/, "");
    if (candidate === "/dev/null" || candidate.startsWith("/dev/fd/")) {
      continue;
    }
    if (!isInsideWorkspace(candidate)) {
      return "Shell command contains an absolute path outside the application workspace.";
    }
  }
  return null;
}

function findViolation(value, key = "") {
  if (Array.isArray(value)) {
    for (const item of value) {
      const violation = findViolation(item, key);
      if (violation) return violation;
    }
    return null;
  }

  if (!value || typeof value !== "object") {
    if (typeof value !== "string" || !pathKeys.has(key.toLowerCase())) {
      return null;
    }

    const candidate = value.startsWith("file://") ? fileURLToPath(value) : value;
    if (isSensitivePath(candidate)) {
      return "This action targets a protected secret or credential file.";
    }
    if (!isInsideWorkspace(candidate)) {
      return "This action targets a path outside the application workspace.";
    }
    return null;
  }

  for (const [childKey, childValue] of Object.entries(value)) {
    const violation = findViolation(childValue, childKey);
    if (violation) return violation;
  }
  return null;
}

function requiresApproval(toolName) {
  return !/^(view|rg|glob)$/i.test(toolName);
}

async function main() {
  const lines = [];
  for await (const line of readline.createInterface({ input: process.stdin })) {
    lines.push(line);
  }

  let input;
  try {
    input = JSON.parse(lines.join("\n"));
  } catch {
    respond("deny", "Guardrail could not inspect this tool request.");
    return;
  }

  const toolName = String(input.tool_name || input.toolName || "");
  const violation =
    findViolation(input) ||
    (/terminal|shell|bash|command|execute/i.test(toolName)
      ? findShellPathViolation(input)
      : null);
  if (violation) {
    respond("deny", violation);
    return;
  }

  if (requiresApproval(toolName)) {
    respond(
      "ask",
      "This tool requires your approval because its full effects cannot be reliably constrained to this workspace.",
    );
    return;
  }

  respond("allow", "Tool request is within the configured workspace path checks.");
}

main().catch(() => {
  respond("deny", "Guardrail failed closed while inspecting this tool request.");
});
