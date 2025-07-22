# mk-git-commit

Git コミットメッセージを自動生成する CLI ツールです。AIを使用して変更内容を分析し、Conventional Commits 形式に従った日本語のコミットメッセージを生成します。

## 特徴

- 🤖 複数のAIプロバイダーに対応（OpenRouter、Groq、ローカルLLM、Gemini CLI、Claude Code、Codex）
- 📝 Conventional Commits 形式に準拠
- 🇯🇵 日本語でのコミットメッセージ生成
- 🎯 変更内容を自動的に分析して適切なタイプ（feat、fix、improve等）を選択
- 🖥️ インタラクティブなCLIインターフェース

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/moezakura/mk-commit-message.git
cd mk-git-commit

# 依存関係をインストール
bun install
```

## 設定

1. `config.example.yaml` を `config.yaml` にコピーします：

```bash
cp config.example.yaml config.yaml
```

2. `config.yaml` を編集して、使用するAIサービスのAPIキーを設定します：

```yaml
# モード設定 ("local", "openrouter", "groq", "gemini-cli", "claude-code", または "codex")
api_mode: gemini-cli

# OpenRouter を使用する場合
openrouter:
  api_base_url: https://openrouter.ai/api/v1
  api_key: "YOUR_OPENROUTER_API_KEY_HERE"  # ここにAPIキーを入力
  default_model: deepseek/deepseek-r1

# Groq を使用する場合
groq:
  api_base_url: https://api.groq.com/openai/v1
  api_key: "YOUR_GROQ_API_KEY_HERE"  # ここにAPIキーを入力
  default_model: meta-llama/llama-4-maverick-17b-128e-instruct

# ローカルLLMを使用する場合
local:
  api_base_url: http://localhost:8080/v1  # あなたのローカルLLMサーバーのURL
```

### 利用可能なモード

- `local`: ローカルで動作するLLMサーバー（Ollama、LM Studio等）
- `openrouter`: OpenRouter API
- `groq`: Groq API
- `gemini-cli`: Gemini CLI（事前にインストールが必要）
- `claude-code`: Claude Code（事前にインストールが必要）
- `codex`: Codex（事前にインストールが必要）

## 使用方法

```bash
# アプリケーションを実行
bun run index.ts

# 開発モード（ホットリロード付き）
bun --watch index.ts
```

### 使用手順

1. Git リポジトリ内でコマンドを実行します
2. メニューから実行したい操作を選択します：
   - `Generate commit message` - コミットメッセージを生成
   - `Execute commit` - コミットを実行
   - `Get available models` - 使用可能なモデルを確認
3. 画面の指示に従って操作を完了します

## 開発

### コマンド

```bash
# タイプチェック
bun run typecheck

# プロダクションビルド
bun build index.ts --outdir=dist --target=bun
```

### アーキテクチャ

このプロジェクトはDDD（ドメイン駆動設計）アーキテクチャで構築されています：

- **Domain Layer**: ビジネスロジックとエンティティ
- **Application Layer**: ユースケースの実装
- **Infrastructure Layer**: 外部サービスとの統合（Git、LLM API）
- **Presentation Layer**: CLIインターフェース

詳細は [CLAUDE.md](./CLAUDE.md) を参照してください。

## ライセンス

MIT

