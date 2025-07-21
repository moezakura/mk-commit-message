export class SpinnerService {
  private frames: string[] = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private message: string;
  private currentFrame = 0;
  private intervalId: Timer | null = null;
  private running = false;
  private outputTokens = '';

  constructor(message: string) {
    this.message = message;
  }

  private getStringWidth(str: string): number {
    let width = 0;
    for (let i = 0; i < str.length; i++) {
      // Check for surrogate pairs
      if (
        i + 1 < str.length &&
        str.charCodeAt(i) >= 0xd800 &&
        str.charCodeAt(i) <= 0xdbff &&
        str.charCodeAt(i + 1) >= 0xdc00 &&
        str.charCodeAt(i + 1) <= 0xdfff
      ) {
        width += 2;
        i++;
      }
      // Check for full-width characters
      else if (str.charCodeAt(i) > 0xff) {
        width += 2;
      } else {
        width += 1;
      }
    }
    return width;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.currentFrame = 0;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    // Hide cursor
    process.stdout.write('\x1B[?25l');

    const animateSpeed = Math.floor(Math.random() * (200 - 10 + 1)) + 10;
    this.intervalId = setInterval(() => {
      const frame = this.frames[this.currentFrame];
      const terminalWidth = process.stdout.columns || 80;

      const baseMessage = `${frame} ${this.message}`;
      const baseMessageWidth = this.getStringWidth(baseMessage);
      const availableWidth = terminalWidth - baseMessageWidth - 3;

      let displayTokens = '';
      if (this.outputTokens && availableWidth > 0) {
        const cleanTokens = this.outputTokens.replace(/\n/g, ' ');
        const tokensWidth = this.getStringWidth(cleanTokens);

        if (tokensWidth > availableWidth) {
          const ellipsisWidth = 3;
          const maxContentWidth = availableWidth - ellipsisWidth;

          let currentWidth = 0;
          let startIndex = cleanTokens.length - 1;

          for (let i = cleanTokens.length - 1; i >= 0; i--) {
            const charWidth = this.getStringWidth(cleanTokens[i]);
            if (currentWidth + charWidth <= maxContentWidth) {
              currentWidth += charWidth;
              startIndex = i;
            } else {
              break;
            }
          }

          displayTokens = '...' + cleanTokens.slice(startIndex);
        } else {
          displayTokens = cleanTokens;
        }
      }

      const fullMessage = this.outputTokens
        ? `${baseMessage} (${displayTokens})`
        : baseMessage;

      process.stdout.write(`\r\x1B[K${fullMessage}`);
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }, animateSpeed);
  }

  stop(text?: string) {
    if (!this.running) return;
    this.running = false;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Clear current line
    process.stdout.write('\r\x1B[K');

    if (text) {
      console.log(`✓ ${text}`);
    }

    // Show cursor
    process.stdout.write('\x1B[?25h');
  }

  update(message: string) {
    this.message = message;
  }

  updateTokens(tokens: string) {
    this.outputTokens = tokens;
  }
}