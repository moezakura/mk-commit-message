import { ILLMRepository } from '../../domain/repositories/ILLMRepository';
import { ModelId } from '../../domain/value-objects/ModelId';
import { GitDiff } from '../../domain/value-objects/GitDiff';
import { CommitMessage } from '../../domain/entities/CommitMessage';
import { spawn } from 'child_process';

export class ClaudeCodeLLMRepository implements ILLMRepository {
  private readonly defaultModel = 'claude-3';

  async getAvailableModels(): Promise<ModelId[]> {
    return [ModelId.create(this.defaultModel)];
  }

  async generateCommitMessage(
    diff: GitDiff,
    _modelId: ModelId,
    systemPrompt: string,
    onProgress?: (tokens: string) => void
  ): Promise<CommitMessage> {
    const prompt = `${systemPrompt}

以下のgit diffに基づいて、日本語で簡潔で説明的なコミットメッセージを生成してください。
必要に応じて複数行のコミットメッセージも生成できます。
最後に、生成したコミットメッセージだけをマークダウンのコードブロック(\`\`\`)で囲んで出力してください。:

${diff.getValue()}`;

    return new Promise((resolve, reject) => {
      onProgress?.('Claude Codeで生成中...');
      
      const child = spawn('claude', ['--print']);
      let stdout = '';
      let stderr = '';

      // プロンプトを標準入力に送信
      child.stdin.write(prompt);
      child.stdin.end();

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        reject(new Error(`Claude Code CLI failed to start: ${error.message}`));
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Claude Code CLI failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          const extractedMessage = this.extractLastCodeBlock(stdout);
          resolve(CommitMessage.create(extractedMessage));
        } catch (error) {
          reject(new Error(`Failed to parse Claude output: ${error instanceof Error ? error.message : String(error)}`));
        }
      });
    });
  }

  private extractLastCodeBlock(text: string): string {
    const codeBlockRegex = /```[^\n]*\n([\s\S]*?)```/g;
    let lastMatch = null;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      lastMatch = match;
    }

    if (lastMatch && lastMatch[1]) {
      return lastMatch[1].trim();
    }

    return text.trim();
  }
}
