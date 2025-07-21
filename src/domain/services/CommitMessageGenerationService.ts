import { GitDiff } from '../value-objects/GitDiff';
import { ModelId } from '../value-objects/ModelId';
import { CommitMessage } from '../entities/CommitMessage';
import { ILLMRepository } from '../repositories/ILLMRepository';

export class CommitMessageGenerationService {
  constructor(private readonly llmRepository: ILLMRepository) {}

  async generateMessage(
    diff: GitDiff,
    modelId: ModelId,
    systemPrompt: string,
    onProgress?: (tokens: string) => void
  ): Promise<CommitMessage> {
    if (diff.isEmpty()) {
      return CommitMessage.create('コミット対象の変更はありません');
    }

    return await this.llmRepository.generateCommitMessage(
      diff,
      modelId,
      systemPrompt,
      onProgress
    );
  }

  extractLastCodeBlock(text: string): string {
    const codeBlockRegex = /```[^\n]*\n([\s\S]*?)```/g;
    let lastMatch = null;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      lastMatch = match;
    }

    if (lastMatch && lastMatch[1]) {
      return lastMatch[1].trim();
    }

    return text;
  }
}