export class ModelId {
  private constructor(private readonly value: string) {}

  static create(id: string): ModelId {
    if (!id || typeof id !== 'string') {
      throw new Error('ModelId must be a non-empty string');
    }
    return new ModelId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ModelId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}