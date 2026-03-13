import { Command } from "commander";
import { api } from "../client.js";
import { output } from "../output.js";

interface AnalyticsResponse {
  period: { from: string; to: string };
  [key: string]: unknown;
}

interface TimeSeriesResponse {
  period: { from: string; to: string };
  interval: string;
  data: Record<string, unknown>[];
}

export const analyticsCommand = new Command("analytics")
  .description("View analytics and metrics");

analyticsCommand
  .command("overview")
  .description("High-level summary of all activity")
  .option("--from <date>", "Start date (ISO 8601)")
  .option("--to <date>", "End date (ISO 8601)")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const res = await api<AnalyticsResponse>("/analytics/overview", {
      from: opts.from,
      to: opts.to,
    });

    if (opts.json) {
      output(res, "json");
      return;
    }

    const { period, ...metrics } = res;
    console.log(`Period: ${period.from} → ${period.to}\n`);

    for (const [section, data] of Object.entries(metrics)) {
      console.log(`${section.toUpperCase()}:`);
      if (typeof data === "object" && data !== null) {
        for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
          if (typeof val === "object" && val !== null) {
            console.log(`  ${key}:`);
            for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
              console.log(`    ${k}: ${v}`);
            }
          } else {
            console.log(`  ${key}: ${val}`);
          }
        }
      } else {
        console.log(`  ${data}`);
      }
      console.log();
    }
  });

function addTimeSeriesCommand(
  name: string,
  path: string,
  description: string,
  extraFilters?: { name: string; desc: string }[]
) {
  const cmd = analyticsCommand
    .command(name)
    .description(description)
    .option("--from <date>", "Start date (ISO 8601)")
    .option("--to <date>", "End date (ISO 8601)")
    .option("--interval <interval>", "Granularity: day, week, month", "day")
    .option("--json", "Output as JSON");

  if (extraFilters) {
    for (const f of extraFilters) {
      cmd.option(`--${f.name} <value>`, f.desc);
    }
  }

  cmd.action(async (opts) => {
    const params: Record<string, string | undefined> = {
      from: opts.from,
      to: opts.to,
      interval: opts.interval,
    };
    if (extraFilters) {
      for (const f of extraFilters) {
        const camel = f.name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
        params[f.name.replace(/-/g, "_")] = opts[camel];
      }
    }

    const res = await api<TimeSeriesResponse>(path, params);

    if (opts.json) {
      output(res, "json");
      return;
    }

    console.log(`Period: ${res.period.from} → ${res.period.to} (${res.interval})\n`);
    output(res.data, "table");
  });
}

addTimeSeriesCommand("emails", "/analytics/emails", "Email analytics over time", [
  { name: "status", desc: "Filter: processed, draft_created, filtered, spam_filtered, paired, deduplicated" },
]);

addTimeSeriesCommand("chats", "/analytics/chats", "Chat analytics over time", [
  { name: "platform", desc: "Filter: webchat, whatsapp, messenger, instagram" },
]);

addTimeSeriesCommand("voice", "/analytics/voice", "Voice analytics over time");

addTimeSeriesCommand("leads", "/analytics/leads", "Lead analytics over time", [
  { name: "source", desc: "Filter: chat, voice, whatsapp, messenger, instagram" },
]);

addTimeSeriesCommand("agent-actions", "/analytics/agent-actions", "Agent action analytics over time", [
  { name: "action-type", desc: "Filter: booking_modification, booking_cancellation, date_change, room_upgrade, add_service, special_request, general_inquiry, response_generation, tool_execution" },
  { name: "status", desc: "Filter: pending_approval, auto_executed, manually_approved, rejected, failed, cancelled" },
  { name: "initiator", desc: "Filter: email, chat, voice, whatsapp, messenger, instagram" },
]);
