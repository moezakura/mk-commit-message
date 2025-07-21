import { CommitMessage } from '../entities/CommitMessage';

export interface ICommitMessageRepository {
  save(message: CommitMessage): Promise<void>;
  getLastMessage(): Promise<CommitMessage | null>;
}