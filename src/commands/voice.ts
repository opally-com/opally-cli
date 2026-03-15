import { Command } from "commander";
import { api, validateId, type PaginatedResponse, type SingleResponse } from "../client.js";
import { output, getFormat, paginationHint, type GlobalOpts } from "../output.js";
import { withSpinner } from "../lib/spinner.js";

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
  .action(async (opts, cmd) => {
    const globals: GlobalOpts = cmd.optsWithGlobals();
    const fmt = getFormat(globals);
    const res = await withSpinner(
      { loading: "Fetching voice calls...", success: "Voice calls loaded", fail: "Failed to fetch voice calls" },
      () => api<PaginatedResponse<VoiceCall>>("/conversations/voice", {
        from: opts.from,
        to: opts.to,
        limit: opts.limit,
        cursor: opts.cursor,
      }, globals.apiKey)
    );
    output(res.data, fmt, ["id", "from_number", "to_number", "duration_seconds", "status", "started_at"]);
    if (fmt === "table") paginationHint(res.pagination.next_cursor);
  });

voiceCommand
  .command("get <id>")
  .description("Get voice call details")
  .action(async (id: string, opts, cmd) => {
    const globals: GlobalOpts = cmd.optsWithGlobals();
    const fmt = getFormat(globals);
    const res = await withSpinner(
      { loading: "Fetching call...", success: "Call loaded", fail: "Failed to fetch call" },
      () => api<SingleResponse<VoiceDetail>>(`/conversations/voice/${validateId(id)}`, undefined, globals.apiKey)
    );
    const data = res.data;

    if (fmt === "json") {
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
