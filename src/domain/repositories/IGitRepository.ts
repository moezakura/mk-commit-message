import { GitDiff } from '../value-objects/GitDiff';
import { CommitMessage } from '../entities/CommitMessage';

export interface IGitRepository {
  getDiff(): Promise<GitDiff>;
  commit(message: CommitMessage): Promise<boolean>;
}