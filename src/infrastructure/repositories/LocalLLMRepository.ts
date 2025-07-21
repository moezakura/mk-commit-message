import { ILLMRepository } from '../../domain/repositories/ILLMRepository';
import { ModelId } from '../../domain/value-objects/ModelId';
import { GitDiff } from '../../domain/value-objects/GitDiff';
import { CommitMessage } from '../../domain/entities/CommitMessage';

export class LocalLLMRepository implements ILLMRepository {
  constructor(private readonly apiBaseUrl: string) {}

  async getAvailableModels(): Promise<ModelId[]> {
    const response = await fetch(`${this.apiBaseUrl}/models`);
    
    if (!response.ok) {
      throw new Error(`Failed to get models: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((model: any) => ModelId.create(model.id));
    }
    
    return [];
  }

  async generateCommitMessage(
    diff: GitDiff,
    modelId: ModelId,
    systemPrompt: string,
    onProgress?: (tokens: string) => void
  ): Promise<CommitMessage> {
    const requestBody = {
      model: modelId.getValue(),
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `以下のgit diffに基づいて、日本語で簡潔で説明的なコミットメッセージを生成してください。
必要に応じて複数行のコミットメッセージも生成できます。
最後に、生成したコミットメッセージだけをマークダウンのコードブロック(\`\`\`)で囲んで出力してください。:\n\n${diff.getValue()}`
        }
      ],
      max_tokens: 8192,
      stream: true
    };

    const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${await response.text()}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let fullResponse = '';
    let currentTokens = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices?.[0]?.delta?.content) {
              const content = parsed.choices[0].delta.content;
              fullResponse += content;
              currentTokens += content.replace(/\n/g, ' ');
              
              if (onProgress) {
                onProgress(currentTokens);
              }
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }
    }

    // Extract last code block
    const extractedMessage = this.extractLastCodeBlock(fullResponse);
    return CommitMessage.create(extractedMessage);
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

    return text;
  }
}