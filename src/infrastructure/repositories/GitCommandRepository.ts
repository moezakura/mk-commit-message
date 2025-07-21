import { IGitRepository } from '../../domain/repositories/IGitRepository';
import { GitDiff } from '../../domain/value-objects/GitDiff';
import { CommitMessage } from '../../domain/entities/CommitMessage';

export class GitCommandRepository implements IGitRepository {
  async getDiff(): Promise<GitDiff> {
    const proc = Bun.spawn(['git', 'diff', '--cached'], {
      stdout: 'pipe',
      stderr: 'pipe'
    });

    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      const error = await new Response(proc.stderr).text();
      throw new Error(`Failed to get git diff: ${error}`);
    }

    return GitDiff.create(output);
  }

  async commit(message: CommitMessage): Promise<boolean> {
    try {
      const proc = Bun.spawn(['git', 'commit', '-m', message.getContent()], {
        stdout: 'pipe',
        stderr: 'pipe'
      });

      const exitCode = await proc.exited;
      
      if (exitCode === 0) {
        return true;
      } else {
        const error = await new Response(proc.stderr).text();
        console.error(`コミットの実行に失敗しました: ${error}`);
        return false;
      }
    } catch (error) {
      console.error(`コミットの実行中にエラーが発生しました: ${error}`);
      return false;
    }
  }
}