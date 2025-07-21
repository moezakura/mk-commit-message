export enum ApiModeType {
  LOCAL = 'local',
  OPENROUTER = 'openrouter',
  GROQ = 'groq'
}

export class ApiMode {
  private constructor(private readonly value: ApiModeType) {}

  static create(mode: string): ApiMode {
    if (!Object.values(ApiModeType).includes(mode as ApiModeType)) {
      throw new Error(`Invalid API mode: ${mode}. Must be 'local', 'openrouter', or 'groq'`);
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

  equals(other: ApiMode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}