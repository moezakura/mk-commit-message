# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run the application
bun run index.ts

# Development mode with hot reload
bun --watch index.ts

# Type check the codebase
bun run typecheck

# Build for production
bun build index.ts --outdir=dist --target=bun
```

## Architecture Overview

This is a Git commit message generator built with DDD (Domain-Driven Design) architecture using Bun runtime.

### Layer Structure

1. **Domain Layer** (`src/domain/`)
   - Pure business logic, framework-agnostic
   - Entities: `CommitMessage` - Core business object with validation
   - Value Objects: `GitDiff`, `ModelId`, `ApiMode` - Immutable type-safe wrappers
   - Repository Interfaces: Define boundaries for external systems
   - Domain Services: `CommitMessageGenerationService` - Complex business logic

2. **Application Layer** (`src/application/use-cases/`)
   - Orchestrates domain objects and repositories
   - Use Cases: `GenerateCommitMessageUseCase`, `ExecuteCommitUseCase`, `GetAvailableModelsUseCase`

3. **Infrastructure Layer** (`src/infrastructure/`)
   - Concrete implementations of repository interfaces
   - Git integration: `GitCommandRepository`
   - LLM integrations: `LocalLLMRepository`, `OpenRouterLLMRepository`, `GroqLLMRepository`
   - Configuration: `ConfigLoader` - YAML-based configuration

4. **Presentation Layer** (`src/presentation/`)
   - CLI interface with interactive menu
   - Japanese language UI

### Key Patterns

- **Repository Pattern**: All external dependencies are abstracted behind interfaces
- **Factory Pattern**: Domain objects use `create()` methods with validation
- **Dependency Injection**: Constructor-based, configured in `index.ts`
- **Immutability**: All domain objects are immutable with private constructors

## Configuration

The application uses `config.yaml` for configuration:
- API mode selection: `local`, `openrouter`, or `groq`
- API endpoints and keys for each mode
- System prompt for commit message generation (detailed Japanese instructions)

## Development Notes

- Runtime: Bun (not Node.js)
- Language: TypeScript with strict mode
- All user-facing messages are in Japanese
- The system prompt in config.yaml defines the commit message format (Conventional Commits in Japanese)