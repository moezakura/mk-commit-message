import { IGitRepository } from '../../domain/repositories/IGitRepository';
import { ILLMRepository } from '../../domain/repositories/ILLMRepository';
import { ICommitMessageRepository } from '../../domain/repositories/ICommitMessageRepository';
import { CommitMessageGenerationService } from '../../domain/services/CommitMessageGenerationService';
import { ModelId } from '../../domain/value-objects/ModelId';
import { CommitMessage } from '../../domain/entities/CommitMessage';

export class GenerateCommitMessageUseCase {
  private readonly generationService: CommitMessageGenerationService;

  constructor(
    private readonly gitRepository: IGitRepository,
    private readonly llmRepository: ILLMRepository,
    private readonly commitMessageRepository: ICommitMessageRepository
  ) {
    this.generationService = new CommitMessageGenerationService(llmRepository);
  }

  async execute(
    modelId: ModelId,
    systemPrompt: string,
    onProgress?: (tokens: string) => void
  ): Promise<CommitMessage> {
    const diff = await this.gitRepository.getDiff();
    
    if (diff.isEmpty()) {
      throw new Error('コミット対象の変更はありません。git add コマンドでファイルをステージングしてください。');
    }

    const commitMessage = await this.generationService.generateMessage(
      diff,
      modelId,
      systemPrompt,
      onProgress
    );

    await this.commitMessageRepository.save(commitMessage);

    return commitMessage;
  }
}