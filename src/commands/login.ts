import { Command } from "commander";
import { loadConfig, saveConfig, getBaseUrl } from "../config.js";
import { withSpinner } from "../lib/spinner.js";
import pc from "picocolors";

const KEY_PATTERN = /^op_live_[0-9a-f]{32}$/;

export const loginCommand = new Command("login")
  .description("Authenticate with the Opally API")
  .argument("[key]", "API key (or omit to open the dashboard)")
  .action(async (key: string | undefined) => {
    if (!key) {
      const url = "https://app.opally.com/integrations";
      console.log(`\n  Create your API key in the Developer section on the Integrations page.\n`);
      console.log(`  ${pc.cyan(url)}\n`);

      // Try to open browser
      try {
        const { exec } = await import("child_process");
        const cmd = process.platform === "darwin" ? "open" : "xdg-open";
        exec(`${cmd} ${url}`);
        console.log(pc.dim("  Opening browser..."));
      } catch {
        // Silently ignore — user can open manually
      }

      console.log(`\n  Then run: ${pc.cyan("opally login <your-api-key>")}\n`);
      return;
    }

    if (!KEY_PATTERN.test(key)) {
      console.error(`${pc.red("Error:")} Invalid key format. Expected op_live_ followed by 32 hex characters.`);
      process.exit(1);
    }

    // Validate key against the API
    const baseUrl = getBaseUrl();
    await withSpinner(
      {
        loading: "Validating API key...",
        success: "API key is valid",
        fail: "Could not validate API key",
      },
      async () => {
        const res = await fetch(
          new URL("/v1/analytics/overview", baseUrl).toString(),
          { headers: { Authorization: `Bearer ${key}` } }
        );
        if (res.status === 401 || res.status === 403) {
          throw new Error("API key rejected");
        }
      }
    ).catch((err) => {
      if (err.message === "API key rejected") {
        console.error(`${pc.red("Error:")} The key was rejected by the Opally API.`);
        process.exit(1);
      }
      console.log(pc.yellow("Warning:") + " Could not reach API to validate. Saving anyway.");
    });

    const config = loadConfig();
    config.api_key = key;
    saveConfig(config);

    console.log(`\n  ${pc.green("Authenticated!")} Key saved to ${pc.dim("~/.opally/config.json")}\n`);
  });
