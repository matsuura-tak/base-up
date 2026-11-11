# ai-org (Antigravity Workspace Plugin)

`https://github.com/matsuura-tak/AI-`（`v0.4.0`）の AI 開発組織を、Antigravity 上でもそのまま動かせるようにしたワークスペースプラグインです。

## 含まれるもの
- **`rules/AGENTS.md`**: メインセッション（指揮役）の常時ルールと `CLAUDE.md` / `.claude/org/app.json` との連携
- **`agents/*.md`**: 9つの専門ロール（`pdm`, `designer`, `design-reviewer`, `tech-lead`, `ios-engineer`, `web-engineer`, `backend-engineer`, `verifier`, `reviewer`）のサブエージェント定義
- **`skills/*`**: 指揮役ワークフロースキル（`feature`, `fix`, `release`, `retro`）
- **`hooks.json` / `scripts/`**: Antigravity 用の `SessionStart` 案内フックと `PreToolUse` 安全ガードフック

> `.claude/`・`.github/`・`docs/org/`・`docs/templates/` は `ai-org` キット本体が管理するため、直接編集しないでください（CI の `org-check` で検証されます）。
