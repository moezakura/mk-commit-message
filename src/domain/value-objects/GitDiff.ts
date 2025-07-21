export class GitDiff {
  private constructor(private readonly value: string) {}

  static create(diff: string): GitDiff {
    if (!diff || typeof diff !== 'string') {
      throw new Error('GitDiff must be a non-empty string');
    }
    return new GitDiff(diff);
  }

  static empty(): GitDiff {
    return new GitDiff('');
  }

  getValue(): string {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value.trim() === '';
  }

  equals(other: GitDiff): boolean {
    return this.value === other.value;
  }
}