import { Command } from "commander";
import { api, validateId, type PaginatedResponse, type SingleResponse } from "../client.js";
import { output } from "../output.js";

interface VoiceCall {
  id: string;
  from_number: string;
  to_number: string;
  started_at: string;
  duration_seconds: number;
  status: string;
}

interface VoiceDetail extends VoiceCall {
  ended_at: string | null;
}

export const voiceCommand = new Command("voice")
  .description("View voice call logs");

voiceCommand
  .command("list")
  .description("List voice calls")
  .option("--from <date>", "Start date (ISO 8601)")
  .option("--to <date>", "End date (ISO 8601)")
  .option("--limit <n>", "Results per page (1-100)")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const res = await api<PaginatedResponse<VoiceCall>>("/conversations/voice", {
      from: opts.from,
      to: opts.to,
      limit: opts.limit,
      cursor: opts.cursor,
    });
    output(res.data, opts.json ? "json" : "table", [
      "id",
      "from_number",
      "to_number",
      "duration_seconds",
      "status",
      "started_at",
    ]);
    if (res.pagination.has_more) {
      console.log(`\nMore results available. Use --cursor ${res.pagination.next_cursor}`);
    }
  });

voiceCommand
  .command("get <id>")
  .description("Get voice call details")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    const res = await api<SingleResponse<VoiceDetail>>(`/conversations/voice/${validateId(id)}`);
    const data = res.data;

    if (opts.json) {
      output(data, "json");
      return;
    }

    console.log(`From:      ${data.from_number}`);
    console.log(`To:        ${data.to_number}`);
    console.log(`Status:    ${data.status}`);
    console.log(`Started:   ${data.started_at}`);
    if (data.ended_at) console.log(`Ended:     ${data.ended_at}`);
    console.log(`Duration:  ${data.duration_seconds}s`);
  });
