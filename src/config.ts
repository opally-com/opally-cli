import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".opally");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface Config {
  api_key?: string;
  base_url?: string;
}

export function loadConfig(): Config {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function saveConfig(config: Config): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", {
    mode: 0o600,
  });
}

export function getApiKey(): string {
  const envKey = process.env.OPALLY_API_KEY;
  if (envKey) return envKey;

  const config = loadConfig();
  if (config.api_key) return config.api_key;

  console.error(
    "No API key found. Set OPALLY_API_KEY or run: opally config set-key <key>"
  );
  process.exit(1);
}

export function getBaseUrl(): string {
  return (
    process.env.OPALLY_BASE_URL ||
    loadConfig().base_url ||
    "https://app.opally.ai"
  );
}
