import { Command } from "commander";
import { api, validateId, type PaginatedResponse, type SingleResponse } from "../client.js";
import { output } from "../output.js";

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
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const res = await api<PaginatedResponse<Lead>>("/leads", {
      from: opts.from,
      to: opts.to,
      source: opts.source,
      limit: opts.limit,
      cursor: opts.cursor,
    });
    output(res.data, opts.json ? "json" : "table", [
      "id",
      "name",
      "email",
      "source",
      "created_at",
    ]);
    if (res.pagination.has_more) {
      console.log(`\nMore results available. Use --cursor ${res.pagination.next_cursor}`);
    }
  });

leadsCommand
  .command("get <id>")
  .description("Get lead details")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    const res = await api<SingleResponse<LeadDetail>>(`/leads/${validateId(id)}`);
    output(res.data, opts.json ? "json" : "table");
  });
