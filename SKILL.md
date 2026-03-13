# Opally

AI-powered receptionist platform for the hospitality industry. Query guest conversations, email activity, voice calls, leads, and analytics.

## Setup

Install the CLI and configure your API key:

```bash
npm install -g @opally/cli
opally config set-key op_live_YOUR_KEY_HERE
```

Or set via environment variable:

```bash
export OPALLY_API_KEY=op_live_YOUR_KEY_HERE
```

## Tools

### leads list
List guest leads from chat, voice, and messaging channels.
```bash
opally leads list [--from <date>] [--to <date>] [--source <chat|voice|whatsapp|messenger|instagram>] [--limit <n>] [--json]
```

### leads get
Get detailed information about a specific lead including their conversation.
```bash
opally leads get <id> [--json]
```

### emails list
List email logs showing processed emails and AI-generated drafts.
```bash
opally emails list [--from <date>] [--to <date>] [--status <processed|draft_created|filtered|spam_filtered|paired|deduplicated>] [--limit <n>] [--json]
```

### emails get
Get email details including the decrypted AI draft and send status.
```bash
opally emails get <id> [--json]
```

### chats list
List chat conversations across all messaging platforms.
```bash
opally chats list [--from <date>] [--to <date>] [--platform <webchat|whatsapp|messenger|instagram>] [--limit <n>] [--json]
```

### chats get
Get chat conversation details including message count and guest email.
```bash
opally chats get <id> [--json]
```

### chats messages
Read the full message history of a chat conversation.
```bash
opally chats messages <id> [--json]
```

### voice list
List voice call logs.
```bash
opally voice list [--from <date>] [--to <date>] [--limit <n>] [--json]
```

### voice get
Get detailed voice call information.
```bash
opally voice get <id> [--json]
```

### analytics overview
Get a high-level summary of all activity (emails, chats, voice, leads, agent actions).
```bash
opally analytics overview [--from <date>] [--to <date>] [--json]
```

### analytics emails
Time-series email processing metrics.
```bash
opally analytics emails [--from <date>] [--to <date>] [--interval <day|week|month>] [--status <status>] [--json]
```

### analytics chats
Time-series chat activity metrics.
```bash
opally analytics chats [--from <date>] [--to <date>] [--interval <day|week|month>] [--platform <platform>] [--json]
```

### analytics voice
Time-series voice call metrics.
```bash
opally analytics voice [--from <date>] [--to <date>] [--interval <day|week|month>] [--json]
```

### analytics leads
Time-series lead generation metrics.
```bash
opally analytics leads [--from <date>] [--to <date>] [--interval <day|week|month>] [--source <source>] [--json]
```

### analytics agent-actions
Time-series metrics for autonomous agent actions (bookings, modifications, etc).
```bash
opally analytics agent-actions [--from <date>] [--to <date>] [--interval <day|week|month>] [--action-type <type>] [--status <status>] [--initiator <channel>] [--json]
```

### doctor
Run environment diagnostics (CLI version, API key, connectivity).
```bash
opally doctor [--json]
```

## Notes

- All dates are ISO 8601 format (e.g., `2026-03-01`)
- Date ranges are capped at 365 days
- Output is automatically JSON when piped or used by AI agents (no `--json` flag needed)
- Use `--json` to force JSON output in a terminal
- Pagination: use `--cursor` with the cursor returned from list commands
- Default limit is 25 results, max 100
