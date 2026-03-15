import { Command } from "commander";
import { loadConfig, saveConfig, maskKey } from "../config.js";
import pc from "picocolors";

export const configCommand = new Command("config")
  .description("Manage CLI configuration");

configCommand
  .command("set-url <url>")
  .description("Set the Opally API base URL")
  .action((url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        console.error(`${pc.red("Error:")} Base URL must use HTTPS.`);
        process.exit(1);
      }
    } catch {
      console.error(`${pc.red("Error:")} Invalid URL format.`);
      process.exit(1);
    }
    const config = loadConfig();
    config.base_url = url;
    saveConfig(config);
    console.log(`Base URL set to ${pc.cyan(url)}`);
  });

configCommand
  .command("show")
  .description("Show current configuration")
  .action(() => {
    const config = loadConfig();
    const envKey = process.env.OPALLY_API_KEY;
    const key = envKey || config.api_key;

    console.log(`API key:  ${key ? maskKey(key) : pc.dim("(not set)")}`);
    if (key) {
      console.log(`Source:   ${envKey ? "OPALLY_API_KEY env var" : "~/.opally/config.json"}`);
    }
    console.log(`Base URL: ${config.base_url || pc.dim("https://api.opally.com (default)")}`);
  });
