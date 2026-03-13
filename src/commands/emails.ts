import { Command } from "commander";
import { api, validateId, type PaginatedResponse, type SingleResponse } from "../client.js";
import { output, getFormat } from "../output.js";

interface EmailLog {
  id: string;
  subject: string;
  sender: string;
  status: string;
  timestamp: string;
}

interface EmailDetail extends EmailLog {
  draft: {
    id: string;
    subject: string;
    body: string;
    status: string;
    draft_created_at: string;
    sent_at: string | null;
  } | null;
}

export const emailsCommand = new Command("emails")
  .description("View email conversations");

emailsCommand
  .command("list")
  .description("List email logs")
  .option("--from <date>", "Start date (ISO 8601)")
  .option("--to <date>", "End date (ISO 8601)")
  .option("--status <status>", "Filter: processed, draft_created, filtered, spam_filtered, paired, deduplicated")
  .option("--limit <n>", "Results per page (1-100)")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const fmt = getFormat(opts);
    const res = await api<PaginatedResponse<EmailLog>>("/conversations/emails", {
      from: opts.from,
      to: opts.to,
      status: opts.status,
      limit: opts.limit,
      cursor: opts.cursor,
    });
    output(res.data, fmt, [
      "id",
      "subject",
      "sender",
      "status",
      "timestamp",
    ]);
    if (fmt === "table" && res.pagination.has_more) {
      console.log(`\nMore results available. Use --cursor ${res.pagination.next_cursor}`);
    }
  });

emailsCommand
  .command("get <id>")
  .description("Get email details with draft")
  .option("--json", "Output as JSON")
  .action(async (id: string, opts) => {
    const fmt = getFormat(opts);
    const res = await api<SingleResponse<EmailDetail>>(`/conversations/emails/${validateId(id)}`);
    const data = res.data;

    if (fmt === "json") {
      output(data, "json");
      return;
    }

    console.log(`Subject:  ${data.subject}`);
    console.log(`Sender:   ${data.sender}`);
    console.log(`Status:   ${data.status}`);
    console.log(`Time:     ${data.timestamp}`);

    if (data.draft) {
      console.log(`\n--- Draft ---`);
      console.log(`Subject:  ${data.draft.subject}`);
      console.log(`Status:   ${data.draft.status}`);
      console.log(`Created:  ${data.draft.draft_created_at}`);
      if (data.draft.sent_at) console.log(`Sent:     ${data.draft.sent_at}`);
      console.log(`\n${data.draft.body}`);
    }
  });
