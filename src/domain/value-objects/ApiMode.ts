export enum ApiModeType {
  LOCAL = 'local',
  OPENROUTER = 'openrouter',
  GROQ = 'groq',
  GEMINI_CLI = 'gemini-cli',
  CLAUDE_CODE = 'claude-code',
  CODEX = 'codex'
}

export class ApiMode {
  private constructor(private readonly value: ApiModeType) {}

  static create(mode: string): ApiMode {
    if (!Object.values(ApiModeType).includes(mode as ApiModeType)) {
      throw new Error(`Invalid API mode: ${mode}. Must be 'local', 'openrouter', 'groq', 'gemini-cli', 'claude-code', or 'codex'`);
    }
    return new ApiMode(mode as ApiModeType);
  }

  static local(): ApiMode {
    return new ApiMode(ApiModeType.LOCAL);
  }

  static openRouter(): ApiMode {
    return new ApiMode(ApiModeType.OPENROUTER);
  }

  static groq(): ApiMode {
    return new ApiMode(ApiModeType.GROQ);
  }

  static geminiCli(): ApiMode {
    return new ApiMode(ApiModeType.GEMINI_CLI);
  }

  static claudeCode(): ApiMode {
    return new ApiMode(ApiModeType.CLAUDE_CODE);
  }

  static codex(): ApiMode {
    return new ApiMode(ApiModeType.CODEX);
  }

  getValue(): ApiModeType {
    return this.value;
  }

  isLocal(): boolean {
    return this.value === ApiModeType.LOCAL;
  }

  isOpenRouter(): boolean {
    return this.value === ApiModeType.OPENROUTER;
  }

  isGroq(): boolean {
    return this.value === ApiModeType.GROQ;
  }

  isGeminiCli(): boolean {
    return this.value === ApiModeType.GEMINI_CLI;
  }

  isClaudeCode(): boolean {
    return this.value === ApiModeType.CLAUDE_CODE;
  }

  isCodex(): boolean {
    return this.value === ApiModeType.CODEX;
  }

  equals(other: ApiMode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}