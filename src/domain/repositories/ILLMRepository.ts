import { ModelId } from '../value-objects/ModelId';
import { GitDiff } from '../value-objects/GitDiff';
import { CommitMessage } from '../entities/CommitMessage';

export interface ILLMRepository {
  getAvailableModels(): Promise<ModelId[]>;
  generateCommitMessage(
    diff: GitDiff,
    modelId: ModelId,
    systemPrompt: string,
    onProgress?: (tokens: string) => void
  ): Promise<CommitMessage>;
}