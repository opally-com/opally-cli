import { readFileSync } from "fs";
import { join } from "path";

let cached: string | undefined;

export function getVersion(): string {
  if (cached) return cached;
  // Walk up from dist/lib/ or src/lib/ to find package.json
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
      cached = pkg.version;
      return cached!;
    } catch {
      dir = join(dir, "..");
    }
  }
  cached = "0.0.0";
  return cached;
}
