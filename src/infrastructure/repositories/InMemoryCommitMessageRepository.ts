import { ICommitMessageRepository } from '../../domain/repositories/ICommitMessageRepository';
import { CommitMessage } from '../../domain/entities/CommitMessage';

export class InMemoryCommitMessageRepository implements ICommitMessageRepository {
  private lastMessage: CommitMessage | null = null;

  async save(message: CommitMessage): Promise<void> {
    this.lastMessage = message;
  }

  async getLastMessage(): Promise<CommitMessage | null> {
    return this.lastMessage;
  }
}