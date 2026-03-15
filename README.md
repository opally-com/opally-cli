# @opally/cli

CLI for the [Opally API](https://opally.gitbook.io/opally-api-docs) — query guest conversations, emails, voice calls, leads, and analytics from your terminal.

## Install

```bash
npm install -g @opally/cli
```

## Setup

```bash
opally login op_live_YOUR_KEY_HERE
```

Get your API key from the Opally dashboard under **Integrations > Developer > API Access**.

Running `opally login` without a key will open the dashboard in your browser.

Or use an environment variable:

```bash
export OPALLY_API_KEY=op_live_YOUR_KEY_HERE
```

## Usage

```bash
# List recent emails
opally emails list --limit 5

# Get email details with AI draft
opally emails get <id>

# List chat conversations
opally chats list --from 2026-03-01

# Read chat messages
opally chats messages <id>

# Voice call logs
opally voice list

# Leads
opally leads list --source chat

# Analytics overview
opally analytics overview --from 2026-03-01 --to 2026-03-31

# Time-series analytics
opally analytics emails --interval week --status draft_created
```

Output is automatically JSON when piped or used by AI agents. Use `--json` to force JSON in a terminal, or `-q/--quiet` to suppress all non-data output.

## Global Options

| Option | Description |
|--------|-------------|
| `--api-key <key>` | Override API key for this command |
| `--json` | Force JSON output |
| `-q, --quiet` | Suppress spinners and non-data output (implies `--json`) |

## Commands

| Command | Description |
|---------|-------------|
| `opally login [key]` | Authenticate with the Opally API |
| `opally emails list` | List email logs |
| `opally emails get <id>` | Email details with AI draft |
| `opally chats list` | List chat conversations |
| `opally chats get <id>` | Chat conversation details |
| `opally chats messages <id>` | Full message history |
| `opally voice list` | List voice calls |
| `opally voice get <id>` | Voice call details |
| `opally leads list` | List guest leads |
| `opally leads get <id>` | Lead details |
| `opally analytics overview` | High-level activity summary |
| `opally analytics emails` | Email metrics over time |
| `opally analytics chats` | Chat metrics over time |
| `opally analytics voice` | Voice metrics over time |
| `opally analytics leads` | Lead metrics over time |
| `opally analytics agent-actions` | Agent action metrics over time |
| `opally config set-url <url>` | Set custom API base URL |
| `opally config show` | Show current configuration |
| `opally doctor` | Run environment diagnostics |

## Documentation

Full API documentation: [opally.gitbook.io/opally-api-docs](https://opally.gitbook.io/opally-api-docs)

## License

MIT
