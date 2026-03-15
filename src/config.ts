import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".opally");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface Config {
  api_key?: string;
  base_url?: string;
}

export interface ResolvedKey {
  key: string;
  source: "flag" | "env" | "config";
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

export function resolveApiKey(flagValue?: string): ResolvedKey {
  if (flagValue) return { key: flagValue, source: "flag" };

  const envKey = process.env.OPALLY_API_KEY;
  if (envKey) return { key: envKey, source: "env" };

  const config = loadConfig();
  if (config.api_key) return { key: config.api_key, source: "config" };

  return null!;
}

export function getApiKey(flagValue?: string): string {
  const resolved = resolveApiKey(flagValue);
  if (resolved) return resolved.key;

  console.error(
    "No API key found. Set OPALLY_API_KEY or run: opally login"
  );
  process.exit(1);
}

export function getBaseUrl(): string {
  return (
    process.env.OPALLY_BASE_URL ||
    loadConfig().base_url ||
    "https://api.opally.com"
  );
}

export function maskKey(key: string): string {
  if (key.length < 16) return key.slice(0, 4) + "...";
  return key.slice(0, 12) + "..." + key.slice(-4);
}
