import { ApiMode, ApiModeType } from '../../domain/value-objects/ApiMode';
import YAML from 'yaml';

export interface Config {
  apiMode: ApiMode;
  localApiBaseUrl: string;
  openRouterApiBaseUrl: string;
  openRouterApiKey: string;
  groqApiBaseUrl: string;
  groqApiKey: string;
  defaultOpenRouterModel: string;
  defaultGroqModel: string;
  systemPrompt: string;
}

interface YamlConfig {
  api_mode: string;
  local?: {
    api_base_url: string;
  };
  openrouter?: {
    api_base_url: string;
    api_key: string;
    default_model: string;
  };
  groq?: {
    api_base_url: string;
    api_key: string;
    default_model: string;
  };
  commit_prompt: string;
}

export class ConfigLoader {
  private static readonly CONFIG_PATH = './config.yaml';
  private static readonly DEFAULT_PROMPT = `あなたは優れたGitコミットメッセージを生成するアシスタントです。以下の差分に基づいて、簡潔で日本語の説明的なコミットメッセージを生成してください。コミットの種類（feat、fix、refactorなど）を含め、従来のコミット形式に従ってください: 種類(範囲): 説明`;

  static async load(): Promise<Config> {
    try {
      const file = Bun.file(this.CONFIG_PATH);
      const exists = await file.exists();
      
      if (!exists) {
        throw new Error(`設定ファイル ${this.CONFIG_PATH} が見つかりません`);
      }

      const yamlContent = await file.text();
      const yamlConfig: YamlConfig = YAML.parse(yamlContent);

      const apiMode = ApiMode.create(yamlConfig.api_mode);

      // 環境変数からAPIキーを取得（環境変数が優先）
      const openRouterApiKey = process.env.OPENROUTER_API_KEY || yamlConfig.openrouter?.api_key || '';
      const groqApiKey = process.env.GROQ_API_KEY || yamlConfig.groq?.api_key || '';

      return {
        apiMode,
        localApiBaseUrl: yamlConfig.local?.api_base_url || 'http://localhost:9988/v1',
        openRouterApiBaseUrl: yamlConfig.openrouter?.api_base_url || 'https://openrouter.ai/api/v1',
        openRouterApiKey,
        groqApiBaseUrl: yamlConfig.groq?.api_base_url || 'https://api.groq.com/openai/v1',
        groqApiKey,
        defaultOpenRouterModel: yamlConfig.openrouter?.default_model || 'deepseek/deepseek-r1',
        defaultGroqModel: yamlConfig.groq?.default_model || 'llama3-8b-8192',
        systemPrompt: yamlConfig.commit_prompt || this.DEFAULT_PROMPT
      };
    } catch (error) {
      console.error(`設定ファイル読み込みエラー: ${error}`);
      throw error;
    }
  }

  static validateConfig(config: Config): void {
    if (config.apiMode.isOpenRouter() && !config.openRouterApiKey) {
      throw new Error(
        'エラー: OpenRouterモードの場合、OPENROUTER_API_KEYを設定する必要があります。\n' +
        '環境変数として設定するか、config.yamlに設定してください: export OPENROUTER_API_KEY="your_api_key_here"'
      );
    }

    if (config.apiMode.isGroq() && !config.groqApiKey) {
      throw new Error(
        'エラー: Groqモードの場合、GROQ_API_KEYを設定する必要があります。\n' +
        '環境変数として設定するか、config.yamlに設定してください: export GROQ_API_KEY="your_api_key_here"'
      );
    }
  }
}