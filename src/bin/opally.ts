#!/usr/bin/env node

import { Command } from "commander";
import { getVersion } from "../lib/version.js";
import { checkForUpdate } from "../lib/update-check.js";
import { configCommand } from "../commands/config.js";
import { loginCommand } from "../commands/login.js";
import { leadsCommand } from "../commands/leads.js";
import { emailsCommand } from "../commands/emails.js";
import { chatsCommand } from "../commands/chats.js";
import { voiceCommand } from "../commands/voice.js";
import { analyticsCommand } from "../commands/analytics.js";
import { doctorCommand } from "../commands/doctor.js";

const program = new Command();

program
  .name("opally")
  .description("CLI for the Opally API")
  .version(getVersion())
  .option("--api-key <key>", "Override API key for this command")
  .option("--json", "Force JSON output")
  .option("-q, --quiet", "Suppress spinners and non-data output (implies --json)")
  .hook("preAction", (_thisCommand, actionCommand) => {
    const opts = actionCommand.optsWithGlobals();
    if (opts.quiet) {
      actionCommand.setOptionValue("json", true);
    }
  });

program.addCommand(loginCommand);
program.addCommand(configCommand);
program.addCommand(emailsCommand);
program.addCommand(chatsCommand);
program.addCommand(voiceCommand);
program.addCommand(leadsCommand);
program.addCommand(analyticsCommand);
program.addCommand(doctorCommand);

program.parseAsync().then(() => checkForUpdate());
