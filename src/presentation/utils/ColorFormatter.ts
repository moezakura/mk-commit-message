export class ColorFormatter {
  static readonly GREEN = '\x1b[32m';
  static readonly YELLOW = '\x1b[33m';
  static readonly RED = '\x1b[31m';
  static readonly RESET = '\x1b[0m';

  static success(text: string): string {
    return `${this.GREEN}${text}${this.RESET}`;
  }

  static warning(text: string): string {
    return `${this.YELLOW}${text}${this.RESET}`;
  }

  static error(text: string): string {
    return `${this.RED}${text}${this.RESET}`;
  }

  static formatSuccess(text: string): void {
    console.log(this.success(text));
  }

  static formatWarning(text: string): void {
    console.log(this.warning(text));
  }

  static formatError(text: string): void {
    console.error(this.error(text));
  }
}