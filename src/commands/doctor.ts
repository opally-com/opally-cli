import { Command } from "commander";
import { resolveApiKey, getBaseUrl, maskKey } from "../config.js";
import { json, type GlobalOpts } from "../output.js";
import { getVersion } from "../lib/version.js";
import pc from "picocolors";

interface Check {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
}

export const doctorCommand = new Command("doctor")
  .description("Run environment diagnostics")
  .action(async (_opts, cmd) => {
    const globals: GlobalOpts = cmd.optsWithGlobals();
    const checks: Check[] = [];
    const isJson = globals.json || globals.quiet || !process.stdout.isTTY;

    // 1. CLI Version
    const version = getVersion();
    checks.push({
      name: "CLI Version",
      status: "pass",
      message: `v${version}`,
    });

    // 2. API Key
    const resolved = resolveApiKey(globals.apiKey);

    if (resolved) {
      checks.push({
        name: "API Key",
        status: "pass",
        message: `${maskKey(resolved.key)} (source: ${resolved.source})`,
      });
    } else {
      checks.push({
        name: "API Key",
        status: "fail",
        message: "No API key found. Run: opally login <key>",
      });
    }

    // 3. Base URL
    const baseUrl = getBaseUrl();
    checks.push({
      name: "Base URL",
      status: "pass",
      message: baseUrl,
    });

    // 4. API Connection
    if (resolved) {
      try {
        const res = await fetch(new URL("/v1/analytics/overview", baseUrl).toString(), {
          headers: { Authorization: `Bearer ${resolved.key}` },
        });
        if (res.ok) {
          checks.push({
            name: "API Connection",
            status: "pass",
            message: "Connected",
          });
        } else if (res.status === 401 || res.status === 403) {
          checks.push({
            name: "API Connection",
            status: "fail",
            message: "API key rejected (401/403)",
          });
        } else {
          checks.push({
            name: "API Connection",
            status: "warn",
            message: `Unexpected response (HTTP ${res.status})`,
          });
        }
      } catch {
        checks.push({
          name: "API Connection",
          status: "fail",
          message: `Could not reach ${baseUrl}`,
        });
      }
    } else {
      checks.push({
        name: "API Connection",
        status: "fail",
        message: "Skipped (no API key)",
      });
    }

    // Output
    const ok = checks.every((c) => c.status !== "fail");

    if (isJson) {
      json({ ok, checks });
    } else {
      console.log("\n  Opally Doctor\n");
      for (const check of checks) {
        const icon = check.status === "pass" ? pc.green("✔")
          : check.status === "warn" ? pc.yellow("!")
          : pc.red("✖");
        console.log(`  ${icon} ${check.name}: ${check.message}`);
      }
      console.log();
    }

    if (!ok) process.exit(1);
  });
