#!/usr/bin/env node

import { Command } from "commander";
import { configCommand } from "../commands/config.js";
import { leadsCommand } from "../commands/leads.js";
import { emailsCommand } from "../commands/emails.js";
import { chatsCommand } from "../commands/chats.js";
import { voiceCommand } from "../commands/voice.js";
import { analyticsCommand } from "../commands/analytics.js";

const program = new Command();

program
  .name("opally")
  .description("CLI for the Opally API")
  .version("0.1.2");

program.addCommand(configCommand);
program.addCommand(leadsCommand);
program.addCommand(emailsCommand);
program.addCommand(chatsCommand);
program.addCommand(voiceCommand);
program.addCommand(analyticsCommand);

program.parse();
