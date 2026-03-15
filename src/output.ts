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
    console.log("No results.");
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
  const header = cols.map((col, i) => col.padEnd(widths[i])).join("  ");
  const separator = widths.map((w) => "─".repeat(w)).join("──");

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

/**
 * Resolve output format: --json flag wins, otherwise auto-detect
 * based on whether stdout is a TTY (terminal = table, piped = json).
 */
export function getFormat(opts: { json?: boolean }): "table" | "json" {
  if (opts.json) return "json";
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
