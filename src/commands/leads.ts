import { Command } from "commander";
import { api, validateId, type PaginatedResponse, type SingleResponse } from "../client.js";
import { output, getFormat, paginationHint, type GlobalOpts } from "../output.js";
import { withSpinner } from "../lib/spinner.js";

interface Lead {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  source: string;
  created_at: string;
}

interface LeadDetail extends Lead {
  conversation_id: string | null;
  conversation: {
    id: string;
    title: string;
    platform: string;
    language: string;
    created_at: string;
  } | null;
}

export const leadsCommand = new Command("leads")
  .description("Manage chat leads");

leadsCommand
  .command("list")
  .description("List leads")
  .option("--from <date>", "Start date (ISO 8601)")
  .option("--to <date>", "End date (ISO 8601)")
  .option("--source <source>", "Filter: chat, voice, whatsapp, messenger, instagram")
  .option("--limit <n>", "Results per page (1-100)")
  .option("--cursor <cursor>", "Pagination cursor")
  .action(async (opts, cmd) => {
    const globals: GlobalOpts = cmd.optsWithGlobals();
    const fmt = getFormat(globals);
    const res = await withSpinner(
      { loading: "Fetching leads...", success: "Leads loaded", fail: "Failed to fetch leads" },
      () => api<PaginatedResponse<Lead>>("/leads", {
        from: opts.from,
        to: opts.to,
        source: opts.source,
        limit: opts.limit,
        cursor: opts.cursor,
      }, globals.apiKey)
    );
    output(res.data, fmt, ["id", "name", "email", "source", "created_at"]);
    if (fmt === "table") paginationHint(res.pagination.next_cursor);
  });

leadsCommand
  .command("get <id>")
  .description("Get lead details")
  .action(async (id: string, opts, cmd) => {
    const globals: GlobalOpts = cmd.optsWithGlobals();
    const res = await withSpinner(
      { loading: "Fetching lead...", success: "Lead loaded", fail: "Failed to fetch lead" },
      () => api<SingleResponse<LeadDetail>>(`/leads/${validateId(id)}`, undefined, globals.apiKey)
    );
    output(res.data, getFormat(globals));
  });
