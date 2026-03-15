import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import pc from "picocolors";
import { getVersion } from "./version.js";

const CACHE_DIR = join(homedir(), ".opally");
const CACHE_FILE = join(CACHE_DIR, "update-check.json");
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  latest: string;
  checked_at: number;
}

function readCache(): CacheEntry | null {
  try {
    if (!existsSync(CACHE_FILE)) return null;
    const data = JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
    if (Date.now() - data.checked_at < CACHE_TTL) return data;
    return null;
  } catch {
    return null;
  }
}

function writeCache(latest: string): void {
  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true, mode: 0o700 });
    }
    writeFileSync(
      CACHE_FILE,
      JSON.stringify({ latest, checked_at: Date.now() }),
      { mode: 0o600 }
    );
  } catch {
    // Silently ignore cache write failures
  }
}

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch("https://registry.npmjs.org/@opally/cli/latest", {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { version: string };
    return data.version;
  } catch {
    return null;
  }
}

function isNewer(latest: string, current: string): boolean {
  const a = latest.split(".").map(Number);
  const b = current.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
}

export async function checkForUpdate(): Promise<void> {
  if (process.env.OPALLY_NO_UPDATE_CHECK || !process.stderr.isTTY) return;

  const current = getVersion();
  const cached = readCache();
  let latest: string | null;

  if (cached) {
    latest = cached.latest;
  } else {
    latest = await fetchLatestVersion();
    if (latest) writeCache(latest);
  }

  if (latest && isNewer(latest, current)) {
    process.stderr.write(
      `\n  ${pc.yellow("Update available!")} ${pc.dim(`v${current}`)} ${pc.dim("→")} ${pc.green(`v${latest}`)}\n` +
      `  Run ${pc.cyan("npm update -g @opally/cli")} to update\n\n`
    );
  }
}
