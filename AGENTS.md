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
