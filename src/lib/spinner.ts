import pc from "picocolors";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const INTERVAL = 80;

interface Spinner {
  update(msg: string): void;
  stop(msg: string): void;
  fail(msg: string): void;
}

function createSpinner(message: string): Spinner {
  if (!process.stderr.isTTY) {
    return { update() {}, stop() {}, fail() {} };
  }

  let i = 0;
  let text = message;

  const timer = setInterval(() => {
    const frame = pc.cyan(FRAMES[i % FRAMES.length]);
    process.stderr.write(`\r\x1B[2K${frame} ${text}`);
    i++;
  }, INTERVAL);

  return {
    update(msg: string) {
      text = msg;
    },
    stop(msg: string) {
      clearInterval(timer);
      process.stderr.write(`\r\x1B[2K${pc.green("✔")} ${msg}\n`);
    },
    fail(msg: string) {
      clearInterval(timer);
      process.stderr.write(`\r\x1B[2K${pc.red("✖")} ${msg}\n`);
    },
  };
}

export async function withSpinner<T>(
  messages: { loading: string; success: string; fail: string },
  fn: () => Promise<T>
): Promise<T> {
  const spinner = createSpinner(messages.loading);
  try {
    const result = await fn();
    spinner.stop(messages.success);
    return result;
  } catch (err) {
    spinner.fail(messages.fail);
    throw err;
  }
}
