import pc from "picocolors";

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

export function table(
  rows: Record<string, unknown>[],
  columns?: string[]
): void {
  if (rows.length === 0) {
    console.log(pc.dim("No results."));
    return;
  }

  const cols = columns || Object.keys(rows[0]);

  // Calculate column widths
  const widths = cols.map((col) =>
    Math.max(
      col.length,
      ...rows.map((row) => formatValue(row[col]).length)
    )
  );

  // Header
  const header = cols.map((col, i) => pc.bold(col.padEnd(widths[i]))).join("  ");
  const separator = pc.dim(widths.map((w) => "─".repeat(w)).join("──"));

  console.log(header);
  console.log(separator);

  // Rows
  for (const row of rows) {
    const line = cols
      .map((col, i) => formatValue(row[col]).padEnd(widths[i]))
      .join("  ");
    console.log(line);
  }
}

export function json(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export interface GlobalOpts {
  json?: boolean;
  quiet?: boolean;
  apiKey?: string;
}

/**
 * Resolve output format: --json/--quiet flag wins, otherwise auto-detect
 * based on whether stdout is a TTY (terminal = table, piped = json).
 */
export function getFormat(opts: GlobalOpts): "table" | "json" {
  if (opts.json || opts.quiet) return "json";
  return process.stdout.isTTY ? "table" : "json";
}

export function output(
  data: unknown,
  format: "table" | "json",
  columns?: string[]
): void {
  if (format === "json") {
    json(data);
  } else if (Array.isArray(data)) {
    table(data as Record<string, unknown>[], columns);
  } else {
    json(data);
  }
}

export function outputError(message: string, opts?: GlobalOpts): never {
  const isJson = opts?.json || opts?.quiet || !process.stderr.isTTY;
  if (isJson) {
    console.error(JSON.stringify({ error: { message } }));
  } else {
    console.error(`${pc.red("Error:")} ${message}`);
  }
  process.exit(1);
}

export function paginationHint(cursor: string | null): void {
  if (cursor && process.stdout.isTTY) {
    console.log(pc.dim(`\nMore results available. Use --cursor ${cursor}`));
  }
}
