import chalk from "chalk";
import { Spinner } from "./spinner";

export class Logger {
  private static spinner: Spinner | null = null;

  static info(message: string) {
    console.log(chalk.blue("ℹ"), message);
  }

  static success(message: string) {
    console.log(chalk.green("✓"), message);
  }

  static error(message: string) {
    console.log(chalk.red("✗"), message);
  }

  static warning(message: string) {
    console.log(chalk.yellow("⚠"), message);
  }

  static step(message: string) {
    console.log(chalk.cyan("→"), message);
  }

  static section(title: string) {
    console.log("\n" + chalk.bold.cyan("=".repeat(60)));
    console.log(chalk.bold.cyan(title));
    console.log(chalk.bold.cyan("=".repeat(60)) + "\n");
  }

  static startSpinner(message: string) {
    this.spinner = new Spinner(message);
    this.spinner.start();
  }

  static stopSpinner(success: boolean = true, message?: string) {
    if (this.spinner) {
      this.spinner.stop(success, message);
      this.spinner = null;
    }
  }

  static banner() {
    const width = 60;
    const title = "🚀 Orga AI Next.js CLI";
    const subtitle = "Bootstrap your Next.js project with Orga AI SDKs";
    
    // Helper to get visual width (accounting for emoji taking 2 spaces)
    const getVisualWidth = (str: string): number => {
      // Count emojis as 2 characters, regular chars as 1
      let visualWidth = 0;
      for (const char of str) {
        visualWidth += char.length > 1 ? 2 : 1;
      }
      return visualWidth;
    };
    
    const titleWidth = getVisualWidth(title);
    const subtitleWidth = subtitle.length;
    
    // Calculate padding to center text (accounting for border pipes)
    const titlePadding = Math.floor((width - 2 - titleWidth) / 2);
    const subtitlePadding = Math.floor((width - 2 - subtitleWidth) / 2);
    
    // Calculate right padding to fill remaining space
    const titleRightPad = width - 2 - titleWidth - titlePadding;
    const subtitleRightPad = width - 2 - subtitleWidth - subtitlePadding;
    
    const banner = `
${chalk.bold.cyan(`
╔${"═".repeat(width - 2)}╗
║${" ".repeat(width - 2)}║
║${" ".repeat(titlePadding)}${chalk.bold.white(title)}${" ".repeat(titleRightPad)}║
║${" ".repeat(width - 2)}║
║${" ".repeat(subtitlePadding)}${subtitle}${" ".repeat(subtitleRightPad)}║
║${" ".repeat(width - 2)}║
╚${"═".repeat(width - 2)}╝
`)}
`;
    console.log(banner);
  }
}

