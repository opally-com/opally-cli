import { Command } from "commander";
import { loadConfig, getBaseUrl } from "../config.js";
import { json } from "../output.js";

const VERSION = "0.2.2";

interface Check {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
}

export const doctorCommand = new Command("doctor")
  .description("Run environment diagnostics")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const checks: Check[] = [];
    const isJson = opts.json || !process.stdout.isTTY;

    // 1. CLI Version
    checks.push({
      name: "CLI Version",
      status: "pass",
      message: `v${VERSION}`,
    });

    // 2. API Key
    const envKey = process.env.OPALLY_API_KEY;
    const config = loadConfig();
    const key = envKey || config.api_key;

    if (key) {
      const source = envKey ? "env" : "config";
      const masked = key.slice(0, 12) + "..." + key.slice(-4);
      checks.push({
        name: "API Key",
        status: "pass",
        message: `${masked} (source: ${source})`,
      });
    } else {
      checks.push({
        name: "API Key",
        status: "fail",
        message: "No API key found. Run: opally config set-key <key>",
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
    if (key) {
      try {
        const res = await fetch(new URL("/v1/analytics/overview", baseUrl).toString(), {
          headers: { Authorization: `Bearer ${key}` },
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
      } catch (err) {
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
        const icon = check.status === "pass" ? "\x1b[32m✔\x1b[0m"
          : check.status === "warn" ? "\x1b[33m!\x1b[0m"
          : "\x1b[31m✖\x1b[0m";
        console.log(`  ${icon} ${check.name}: ${check.message}`);
      }
      console.log();
    }

    if (!ok) process.exit(1);
  });
