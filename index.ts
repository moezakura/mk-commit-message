#!/usr/bin/env bun

import { CLI } from './src/presentation/cli/CLI';
import { GenerateCommitMessageUseCase } from './src/application/use-cases/GenerateCommitMessageUseCase';
import { ExecuteCommitUseCase } from './src/application/use-cases/ExecuteCommitUseCase';
import { GetAvailableModelsUseCase } from './src/application/use-cases/GetAvailableModelsUseCase';
import { GitCommandRepository } from './src/infrastructure/repositories/GitCommandRepository';
import { LocalLLMRepository } from './src/infrastructure/repositories/LocalLLMRepository';
import { OpenRouterLLMRepository } from './src/infrastructure/repositories/OpenRouterLLMRepository';
import { GroqLLMRepository } from './src/infrastructure/repositories/GroqLLMRepository';
import { GeminiCLILLMRepository } from './src/infrastructure/repositories/GeminiCLILLMRepository';
import { ClaudeCodeLLMRepository } from './src/infrastructure/repositories/ClaudeCodeLLMRepository';
import { CodexLLMRepository } from './src/infrastructure/repositories/CodexLLMRepository';
import { InMemoryCommitMessageRepository } from './src/infrastructure/repositories/InMemoryCommitMessageRepository';
import { ConfigLoader } from './src/infrastructure/config/ConfigLoader';
import { ColorFormatter } from './src/presentation/utils/ColorFormatter';

async function main() {
  try {
    // Load configuration
    const config = await ConfigLoader.load();
    ConfigLoader.validateConfig(config);

    // System prompt is now loaded from config
    const systemPrompt = config.systemPrompt;

    // Initialize repositories
    const gitRepository = new GitCommandRepository();
    const commitMessageRepository = new InMemoryCommitMessageRepository();
    
    // Initialize LLM repository based on API mode
    let llmRepository;
    if (config.apiMode.isLocal()) {
      llmRepository = new LocalLLMRepository(config.localApiBaseUrl);
    } else if (config.apiMode.isOpenRouter()) {
      llmRepository = new OpenRouterLLMRepository(config.openRouterApiBaseUrl, config.openRouterApiKey);
    } else if (config.apiMode.isGroq()) {
      llmRepository = new GroqLLMRepository(config.groqApiBaseUrl, config.groqApiKey);
    } else if (config.apiMode.isGeminiCli()) {
      llmRepository = new GeminiCLILLMRepository();
    } else if (config.apiMode.isClaudeCode()) {
      llmRepository = new ClaudeCodeLLMRepository();
    } else if (config.apiMode.isCodex()) {
      llmRepository = new CodexLLMRepository();
    } else {
      throw new Error(`Unsupported API mode: ${config.apiMode.toString()}`);
    }

    // Initialize use cases
    const generateCommitMessageUseCase = new GenerateCommitMessageUseCase(
      gitRepository,
      llmRepository,
      commitMessageRepository
    );

    const executeCommitUseCase = new ExecuteCommitUseCase(gitRepository);

    const getAvailableModelsUseCase = new GetAvailableModelsUseCase(
      llmRepository,
      config.apiMode,
      config.defaultOpenRouterModel,
      config.defaultGroqModel
    );

    // Initialize and run CLI
    const cli = new CLI(
      generateCommitMessageUseCase,
      executeCommitUseCase,
      getAvailableModelsUseCase,
      systemPrompt,
      config.apiMode.toString()
    );

    await cli.run();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ColorFormatter.formatError(`エラー: ${errorMessage}`);
    process.exit(1);
  }
}

// Run the application
main();