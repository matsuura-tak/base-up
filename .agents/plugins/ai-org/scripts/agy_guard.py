#!/usr/bin/env python3
"""ai-org の Antigravity 用 PreToolUse ガードフック。

組織の設定ファイル（.claude / .github / .agents）、秘密情報ファイル、
main への直接 push、PR の勝手なマージ、stacks 外のエンジニア呼び出しをブロックする。
"""
import fnmatch
import json
import os
import re
import shlex
import sys

PROTECTED_PARTS = {".claude", ".github", ".agents", ".git"}
SECRET_PATTERNS = (
    ".env",
    ".env.*",
    "*.p8",
    "*.p12",
    "*.pem",
    "*.key",
    "*.mobileprovision",
    "*.provisionprofile",
    "*.keystore",
    "*.jks",
    "*service-account*.json",
    "credentials.json",
)
SECRET_OK = {".env.example", ".env.sample", ".env.template"}
STACK_ROLES = {"ios-engineer": "ios", "web-engineer": "web", "backend-engineer": "backend"}
SENSITIVE_HOME_PREFIXES = (
    os.path.expanduser("~/.ssh"),
    os.path.expanduser("~/.aws"),
    os.path.expanduser("~/.appstoreconnect"),
    os.path.expanduser("~/.config/gh"),
    os.path.expanduser("~/.config/gcloud"),
    os.path.expanduser("~/.netrc"),
    os.path.expanduser("~/.npmrc"),
)


def allow():
    sys.stdout.write('{"decision":"allow"}\n')
    sys.exit(0)


def deny(reason):
    out = {"decision": "deny", "reason": f"[ai-org ガード] {reason}"}
    sys.stdout.write(json.dumps(out, ensure_ascii=False) + "\n")
    sys.exit(0)


def find_repo_root(data):
    ws = data.get("workspacePaths")
    if isinstance(ws, list) and ws and isinstance(ws[0], str) and ws[0]:
        return os.path.realpath(ws[0])
    here = os.path.dirname(os.path.realpath(__file__))
    return os.path.realpath(os.path.join(here, "..", "..", "..", ".."))


def is_secret_name(name):
    if name in SECRET_OK:
        return False
    return any(fnmatch.fnmatchcase(name, pat) for pat in SECRET_PATTERNS)


def check_write_path(raw_path, root):
    if not isinstance(raw_path, str) or not raw_path.strip():
        return
    p = os.path.expanduser(raw_path.strip())
    if not os.path.isabs(p):
        p = os.path.join(root, p)
    real = os.path.realpath(p)
    name = os.path.basename(real)
    if is_secret_name(name):
        deny(f"秘密情報ファイル（{name}）への書き込みは禁止されています。")

    if real == root or real.startswith(root + os.sep):
        rel = os.path.relpath(real, root).replace(os.sep, "/")
        parts = [pt.casefold() for pt in rel.split("/")]
        for prot in PROTECTED_PARTS:
            if prot in parts:
                deny(f"組織・設定フォルダ（{rel}）は AI から変更できません。Takuma に依頼してください。")
        if rel.casefold() == ".mcp.json":
            deny(".mcp.json は AI から変更できません。")


def check_read_path(raw_path, root):
    if not isinstance(raw_path, str) or not raw_path.strip():
        return
    p = os.path.expanduser(raw_path.strip())
    if not os.path.isabs(p):
        p = os.path.join(root, p)
    real = os.path.realpath(p)
    name = os.path.basename(real)
    if is_secret_name(name):
        deny(f"秘密情報ファイル（{name}）の読み取りは禁止されています。")
    for pref in SENSITIVE_HOME_PREFIXES:
        rp = os.path.realpath(pref)
        if real == rp or real.startswith(rp + os.sep):
            deny(f"認証情報パス（{raw_path}）の読み取りは禁止されています。")


def check_subagent(args, root):
    t = (args.get("TypeName") or "").strip()
    if t.casefold() == "self":
        deny(
            "汎用サブエージェント self は使えません。pdm, designer, design-reviewer, tech-lead, "
            "web-engineer, backend-engineer, verifier, reviewer のいずれかを呼んでください。"
        )
    need_stack = STACK_ROLES.get(t.casefold())
    if need_stack:
        try:
            with open(os.path.join(root, ".claude", "org", "app.json"), encoding="utf-8") as f:
                stacks = json.load(f).get("stacks") or []
        except Exception:
            stacks = []
        if need_stack not in stacks:
            deny(f"{t} は app.json の stacks（{stacks}）に含まれていないため呼べません。")


def check_command(cmd):
    if not isinstance(cmd, str) or not cmd.strip():
        return
    # 複数コマンド連結を分割して検査
    segments = re.split(r"(?:&&|\|\||;|\n)", cmd)
    for seg in segments:
        s = seg.strip()
        if not s:
            continue
        try:
            tokens = shlex.split(s)
        except ValueError:
            tokens = s.split()
        if not tokens:
            continue
        # 環境変数代入プレフィックスをスキップ
        idx = 0
        while idx < len(tokens) and "=" in tokens[idx] and not tokens[idx].startswith("-"):
            idx += 1
        toks = tokens[idx:]
        if not toks:
            continue

        head = os.path.basename(toks[0])
        if head == "sudo":
            deny("sudo の実行は禁止されています。")

        if head == "git" and len(toks) >= 2:
            if "--no-verify" in toks:
                deny("git の --no-verify は禁止されています。")
            # git -C <dir> <subcmd> 対応
            g_idx = 1
            while g_idx < len(toks) and toks[g_idx].startswith("-"):
                if toks[g_idx] in ("-C", "-c") and g_idx + 1 < len(toks):
                    g_idx += 2
                else:
                    g_idx += 1
            sub = toks[g_idx] if g_idx < len(toks) else ""
            rest = toks[g_idx + 1 :]
            if sub == "push":
                for r in rest:
                    if r in ("-f", "--force", "--force-with-lease", "--delete", "-d") or r.startswith("+"):
                        deny("git push の強制 push・リモートブランチ削除は禁止されています。")
                    if r in ("main", "master") or r.endswith(":main") or r.endswith(":master") or "refs/heads/main" in r or "refs/heads/master" in r:
                        deny("main / master への直接 push は禁止されています。ブランチから PR を開いてください。")

        if head == "gh" and len(toks) >= 2:
            if toks[1:3] == ["pr", "merge"]:
                deny("PR のマージは Takuma だけが行います。AI からは実行できません。")
            if toks[1:3] in (["repo", "delete"], ["repo", "edit"], ["release", "delete"]):
                deny(f"gh {' '.join(toks[1:3])} は禁止されています。")
            if toks[1] == "secret" or toks[1:3] == ["auth", "token"]:
                deny("GitHub の secret / token 操作は禁止されています。")
            if toks[1] == "api" and any(("rulesets" in x or "protection" in x) for x in toks[2:]):
                deny("ブランチ保護ルール（rulesets / protection）の変更は Takuma だけが行います。")


def main():
    try:
        raw = sys.stdin.buffer.read().decode("utf-8", "replace")
        data = json.loads(raw) if raw.strip() else {}
    except Exception:
        allow()

    root = find_repo_root(data)
    tc = data.get("toolCall") if isinstance(data, dict) else None
    if not isinstance(tc, dict):
        allow()

    name = tc.get("name") or ""
    args = tc.get("args") if isinstance(tc.get("args"), dict) else {}

    if name in ("edit_file", "write_file"):
        check_write_path(args.get("Path"), root)
    elif name == "read_file":
        check_read_path(args.get("Path"), root)
    elif name == "invoke_subagent":
        check_subagent(args, root)
    elif name == "run_command":
        check_command(args.get("CommandLine"))

    allow()


if __name__ == "__main__":
    main()
