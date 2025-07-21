# Git Commit Message Generator

このツールは、ステージングされた Git の変更内容を分析し、AI を使用して適切なコミットメッセージを生成します。

## 設定

`config.yaml`ファイルで以下の設定が可能です：

- `api_mode`: 使用するAPIモード（`local`、`openrouter`、`groq`）
- 各モードの設定（APIベースURL、APIキー、デフォルトモデル）
- `commit_prompt`: コミットメッセージ生成時のシステムプロンプト

## 使用方法

```bash
bun run index.ts
```

