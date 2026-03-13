import { Command } from "commander";
import { loadConfig, saveConfig } from "../config.js";

export const configCommand = new Command("config")
  .description("Manage CLI configuration");

configCommand
  .command("set-key <key>")
  .description("Save your Opally API key")
  .action((key: string) => {
    if (!key.startsWith("op_live_") && !key.startsWith("op_test_")) {
      console.error("Invalid key format. Expected op_live_* or op_test_*");
      process.exit(1);
    }
    if (key.length < 32) {
      console.error("Invalid key format. Key is too short.");
      process.exit(1);
    }
    const config = loadConfig();
    config.api_key = key;
    saveConfig(config);
    console.log("API key saved to ~/.opally/config.json");
  });

configCommand
  .command("set-url <url>")
  .description("Set the Opally API base URL")
  .action((url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        console.error("Base URL must use HTTPS.");
        process.exit(1);
      }
    } catch {
      console.error("Invalid URL format.");
      process.exit(1);
    }
    const config = loadConfig();
    config.base_url = url;
    saveConfig(config);
    console.log(`Base URL set to ${url}`);
  });

configCommand
  .command("show")
  .description("Show current configuration")
  .action(() => {
    const config = loadConfig();
    console.log(`API key: ${config.api_key ? config.api_key.slice(0, 12) + "..." : "(not set)"}`);
    console.log(`Base URL: ${config.base_url || "https://app.opally.ai (default)"}`);
  });
