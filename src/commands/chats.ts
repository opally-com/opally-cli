import { Command } from "commander";
import { api, validateId, type PaginatedResponse, type SingleResponse } from "../client.js";
import { output, getFormat, paginationHint, type GlobalOpts } from "../output.js";
import { withSpinner } from "../lib/spinner.js";

interface Chat {
  id: string;
  title: string;
  platform: string;
  language: string;
  created_at: string;
}

interface ChatDetail extends Chat {
  guest_email: string | null;
  message_count: number;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export const chatsCommand = new Command("chats")
  .description("View chat conversations");

chatsCommand
  .command("list")
  .description("List chat conversations")
  .option("--from <date>", "Start date (ISO 8601)")
  .option("--to <date>", "End date (ISO 8601)")
  .option("--platform <platform>", "Filter: webchat, whatsapp, messenger, instagram")
  .option("--limit <n>", "Results per page (1-100)")
  .option("--cursor <cursor>", "Pagination cursor")
  .action(async (opts, cmd) => {
    const globals: GlobalOpts = cmd.optsWithGlobals();
    const fmt = getFormat(globals);
    const res = await withSpinner(
      { loading: "Fetching chats...", success: "Chats loaded", fail: "Failed to fetch chats" },
      () => api<PaginatedResponse<Chat>>("/conversations/chats", {
        from: opts.from,
        to: opts.to,
        platform: opts.platform,
        limit: opts.limit,
        cursor: opts.cursor,
      }, globals.apiKey)
    );
    output(res.data, fmt, ["id", "title", "platform", "language", "created_at"]);
    if (fmt === "table") paginationHint(res.pagination.next_cursor);
  });

chatsCommand
  .command("get <id>")
  .description("Get chat conversation details")
  .action(async (id: string, opts, cmd) => {
    const globals: GlobalOpts = cmd.optsWithGlobals();
    const fmt = getFormat(globals);
    const res = await withSpinner(
      { loading: "Fetching chat...", success: "Chat loaded", fail: "Failed to fetch chat" },
      () => api<SingleResponse<ChatDetail>>(`/conversations/chats/${validateId(id)}`, undefined, globals.apiKey)
    );
    const data = res.data;

    if (fmt === "json") {
      output(data, "json");
      return;
    }

    console.log(`Title:     ${data.title}`);
    console.log(`Platform:  ${data.platform}`);
    console.log(`Language:  ${data.language}`);
    console.log(`Guest:     ${data.guest_email || "(unknown)"}`);
    console.log(`Messages:  ${data.message_count}`);
    console.log(`Created:   ${data.created_at}`);
  });

chatsCommand
  .command("messages <id>")
  .description("Get messages in a chat conversation")
  .action(async (id: string, opts, cmd) => {
    const globals: GlobalOpts = cmd.optsWithGlobals();
    const fmt = getFormat(globals);
    const res = await withSpinner(
      { loading: "Fetching messages...", success: "Messages loaded", fail: "Failed to fetch messages" },
      () => api<SingleResponse<{ conversation_id: string; messages: Message[] }>>(
        `/conversations/chats/${validateId(id)}/messages`, undefined, globals.apiKey
      )
    );

    const messages = res.data.messages;

    if (fmt === "json") {
      output(messages, "json");
      return;
    }

    for (const msg of messages) {
      const role = msg.role === "assistant" ? "Opally" : "Guest";
      const time = new Date(msg.created_at).toLocaleString();

      // Message content may be JSON-encoded chat parts
      let text = msg.content;
      try {
        const parts = JSON.parse(msg.content);
        if (Array.isArray(parts)) {
          text = parts
            .flatMap((p: { parts?: { type: string; text?: string }[] }) =>
              (p.parts || []).filter((pt) => pt.type === "text").map((pt) => pt.text)
            )
            .filter(Boolean)
            .join("\n") || text;
        }
      } catch {
        // Plain text content, use as-is
      }

      console.log(`[${time}] ${role}:`);
      console.log(`  ${text}\n`);
    }
  });
