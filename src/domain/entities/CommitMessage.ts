export class CommitMessage {
  private constructor(
    private readonly content: string,
    private readonly isMultiline: boolean
  ) {}

  static create(content: string): CommitMessage {
    if (!content || typeof content !== 'string') {
      throw new Error('CommitMessage content must be a non-empty string');
    }
    
    const lines = content.split('\n');
    const isMultiline = lines.length > 1;
    
    return new CommitMessage(content, isMultiline);
  }

  getContent(): string {
    return this.content;
  }

  isMultiLine(): boolean {
    return this.isMultiline;
  }

  getLines(): string[] {
    return this.content.split('\n');
  }

  format(): string {
    if (!this.isMultiline) {
      return `"${this.content.replace(/"/g, '\\"')}"`;
    }
    
    return `"${this.content.replace(/'/g, "\\'").replace(/\n/g, "\\n")}"`;
  }

  equals(other: CommitMessage): boolean {
    return this.content === other.content;
  }
}