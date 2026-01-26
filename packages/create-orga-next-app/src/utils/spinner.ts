import chalk from "chalk";
import { stdout } from "process";

export class Spinner {
  private interval: NodeJS.Timeout | null = null;
  private frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  private frameIndex = 0;
  private message: string;

  constructor(message: string) {
    this.message = message;
  }

  start() {
    this.interval = setInterval(() => {
      const frame = this.frames[this.frameIndex % this.frames.length];
      stdout.write(`\r${chalk.cyan(frame)} ${this.message}`);
      this.frameIndex++;
    }, 80);
  }

  stop(success: boolean = true, finalMessage?: string) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    stdout.write("\r");
    if (finalMessage) {
      const icon = success ? chalk.green("✓") : chalk.red("✗");
      console.log(`${icon} ${finalMessage}`);
    } else {
      const icon = success ? chalk.green("✓") : chalk.red("✗");
      console.log(`${icon} ${this.message}`);
    }
  }
}

