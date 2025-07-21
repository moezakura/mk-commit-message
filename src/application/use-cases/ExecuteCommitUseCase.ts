import { IGitRepository } from '../../domain/repositories/IGitRepository';
import { CommitMessage } from '../../domain/entities/CommitMessage';

export class ExecuteCommitUseCase {
  constructor(private readonly gitRepository: IGitRepository) {}

  async execute(commitMessage: CommitMessage): Promise<boolean> {
    return await this.gitRepository.commit(commitMessage);
  }
}