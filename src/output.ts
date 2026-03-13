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
      ...rows.map((row) => String(row[col] ?? "").length)
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
      .map((col, i) => String(row[col] ?? "").padEnd(widths[i]))
      .join("  ");
    console.log(line);
  }
}

export function json(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
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
