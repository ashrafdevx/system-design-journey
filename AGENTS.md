# AI coding instructions

Tool-independent rules for any AI assistant in this repo. Repo-specific instructions override these.

## Before changing

- Read relevant code and docs first.
- Check the working tree; preserve others' uncommitted changes.
- If the request is ambiguous in a way that affects behavior or scope, ask.

## Changing

- Make the smallest complete change; keep existing behavior unless asked.
- Prefer simple, maintainable code. Reuse existing helpers and dependencies; add new ones only if clearly needed.
- Validate external input; handle errors explicitly, never swallow them.
- Never hard-code or log secrets.
- Update directly related tests and docs.
- Don't touch unrelated files or do destructive actions unless asked.

## Verifying

- Run the narrowest relevant tests, lint, type checks, or build.
- Review the final diff for task-only changes.

## Reporting

- Summarize changes and check results concisely; state any checks you couldn't run.
- Never claim something is done or passing unless verified.

## Guardrails

- Work only inside this application workspace. Do not read or modify files outside the repository root unless the user explicitly approves it.
- Never commit, push, or deploy unless explicitly asked.
- Never run destructive commands (including `rm -rf`, `git reset --hard`, `DROP TABLE`, or force-push) without explicit approval.
- Never touch `.env` files, keys, or credentials, and never print their contents.
- Don't edit generated files, lockfiles, or migrations by hand unless explicitly asked.
- Don't install, upgrade, or remove dependencies without approval.
- Don't change files outside the task scope.
- Don't disable tests, lint, or type checks to make them pass.
- Don't hide errors with empty `catch` blocks or broad `try/except`.
- Don't make production changes or external network calls unless explicitly asked.
- If a requested action would push/deploy, bypass a guardrail, or otherwise require elevated risk, stop and ask for approval first.
- If unsure or blocked, stop and ask instead of guessing.
- The workspace hook denies explicitly out-of-workspace and protected-secret paths, and asks for approval before tools other than basic workspace read/search tools. Hooks only enforce this in editors that support and load the checked-in hook format; in other editors, follow these rules and ask before proceeding.
