import { ILLMRepository } from '../../domain/repositories/ILLMRepository';
import { ModelId } from '../../domain/value-objects/ModelId';
import { GitDiff } from '../../domain/value-objects/GitDiff';
import { CommitMessage } from '../../domain/entities/CommitMessage';
import { spawn } from 'child_process';

export class CodexLLMRepository implements ILLMRepository {
  private readonly defaultModel = 'codex';

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
      onProgress?.('Codexで生成中...');
      
      const child = spawn('codex', ['-q', '--full-stdout', prompt]);
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        reject(new Error(`Codex CLI failed to start: ${error.message}`));
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Codex CLI failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          const extractedMessage = this.extractCodexResponse(stdout);
          resolve(CommitMessage.create(extractedMessage));
        } catch (error) {
          reject(new Error(`Failed to parse Codex output: ${error instanceof Error ? error.message : String(error)}`));
        }
      });
    });
  }

  private extractCodexResponse(stdout: string): string {
    // Parse JSON Lines format from Codex
    const lines = stdout.split('\n').filter(line => line.trim());
    
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const json = JSON.parse(lines[i]);
        if (json.type === 'message' && json.role === 'assistant' && json.content?.[0]?.text) {
          const responseText = json.content[0].text;
          // Extract code block from the response
          return this.extractLastCodeBlock(responseText);
        }
      } catch (e) {
        // Continue to next line if JSON parse fails
      }
    }
    
    throw new Error('No valid response found in Codex output');
  }

  private extractLastCodeBlock(text: string): string {
    const codeBlockRegex = /```[^\n]*\n([\s\S]*?)```/g;
    let lastMatch: RegExpExecArray | null = null;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      lastMatch = match;
    }

    if (lastMatch && lastMatch[1]) {
      return lastMatch[1].trim();
    }

    return text.trim();
  }
}