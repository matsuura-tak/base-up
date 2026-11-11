#!/usr/bin/env python3
"""ai-org の Antigravity 用 SessionStart フック。

新しい会話の開始時に、AI 開発組織の設定（app.json / lock.json / progress.md）を読み取り、
Antigravity の injectSteps 契約に従ってシステムメッセージを注入する。
何があっても失敗させず JSON を返して exit 0 で終了する。
"""
import hashlib
import json
import os
import sys

ORG_DIRS = (".claude/agents", ".claude/hooks", ".claude/rules", ".claude/skills", "docs/org", "docs/templates")


def find_repo_root(data):
    ws = data.get("workspacePaths")
    if isinstance(ws, list) and ws and isinstance(ws[0], str) and ws[0]:
        return os.path.realpath(ws[0])
    here = os.path.dirname(os.path.realpath(__file__))
    return os.path.realpath(os.path.join(here, "..", "..", "..", ".."))


def read_json(path):
    try:
        with open(path, encoding="utf-8") as f:
            val = json.load(f)
        return val if isinstance(val, dict) else None
    except Exception:
        return None


def drifted(root):
    lock = read_json(os.path.join(root, ".claude", "org", "lock.json"))
    files = lock.get("files") if lock else None
    if not isinstance(files, dict):
        return []
    changed = []
    for rel, digest in sorted(files.items()):
        try:
            with open(os.path.join(root, rel), "rb") as f:
                if hashlib.sha256(f.read()).hexdigest() != digest:
                    changed.append(rel)
        except Exception:
            changed.append(rel)
    for d in ORG_DIRS:
        base = os.path.join(root, d)
        if not os.path.isdir(base):
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [n for n in dirnames if n != "__pycache__"]
            for name in filenames:
                rel = os.path.relpath(os.path.join(dirpath, name), root).replace(os.sep, "/")
                if rel not in files and name != ".DS_Store" and not name.endswith(".pyc"):
                    changed.append(rel)
    return changed


def last_records(root, count=3):
    try:
        with open(os.path.join(root, "docs", "progress.md"), encoding="utf-8") as f:
            lines = f.read().splitlines()
    except Exception:
        return None
    start = next((i for i, ln in enumerate(lines) if ln.strip().startswith("## 記録")), -1)
    items = [ln.strip() for ln in lines[start + 1 :] if ln.strip().startswith(("- ", "* ", "| "))]
    return items[-count:]


def build_message(data):
    root = find_repo_root(data)
    app = read_json(os.path.join(root, ".claude", "org", "app.json"))
    ver = (app or {}).get("org_version") or "0.4.0"
    name = (app or {}).get("app_name") or "未設定"
    stacks = ", ".join((app or {}).get("stacks") or []) or "未設定"
    approvals = (app or {}).get("approvals") or "each"

    lines = [
        f"[AI開発組織 v{ver} / Antigravity] リポジトリ「{name}」（stacks: {stacks}）は AI 開発組織で動きます。人間は Takuma だけです。",
        "- メインセッションは指揮役です。PRD・デザイン・契約・コード・テストは自分で書かず、invoke_subagent で専門ロールに1体ずつ任せます。",
        "- 機能開発は feature スキル、小さい修正は fix スキル、リリースは release スキル、振り返りは retro スキルを読んで進めます。初期アイデアは docs/idea-seed.md にあります。",
    ]
    if approvals == "final":
        lines.append(
            "- 承認モードは final（まかせる）です。G0 の承認と裁定は指揮役が記録して進め、G3 通過分を ai-org/batch にまとめ、最後にまとめの PR で Takuma が確認します。"
        )
    else:
        lines.append(
            "- 承認モードは each（毎回確認）です。機能ごとに G0（PRD承認）と main へのマージを Takuma に確認します。"
        )

    changed = drifted(root)
    if changed:
        lines.append(
            f"- 注意：組織のファイルに lock.json との差分があります（{len(changed)} 件、例：{changed[0]}）。自分で直さず Takuma に知らせてください。"
        )

    records = last_records(root)
    if records:
        lines.append("- 直近の進捗（docs/progress.md）：" + " / ".join(records))
    else:
        lines.append("- docs/progress.md にまだ完了記録はありません。")

    return "\n".join(lines)


def main():
    try:
        raw = sys.stdin.buffer.read().decode("utf-8", "replace")
        data = json.loads(raw) if raw.strip() else {}
        if not isinstance(data, dict):
            data = {}
        msg = build_message(data)
        out = {"injectSteps": [{"systemMessage": {"systemMessage": msg}}]}
    except Exception:
        out = {}
    sys.stdout.write(json.dumps(out, ensure_ascii=False) + "\n")
    sys.exit(0)


if __name__ == "__main__":
    main()
