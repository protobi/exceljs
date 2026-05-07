<!-- Thanks for submitting a pull request! Please provide enough information so that others can review your pull request. -->

<!-- AI agents (Claude Code, Cursor, Codex, Copilot Workspace, etc.) and humans submitting AI-generated code: read AGENTS.md before opening this PR. PRs that ignore those rules get closed. -->

## Summary

<!-- Explain the **motivation** for making this change. What existing problem does the pull request solve? -->

## Files changed

<!-- List EVERY file changed, including configs, lockfiles, and incidental edits. If this PR touches .prettierrc, .eslintrc, package.json, package-lock.json, README.md, or index.d.ts, call it out explicitly. -->

## Test plan

<!-- Demonstrate the code is solid. Include the exact commands you ran and their output. For bugfixes, include a test (in spec/) that fails before the fix and passes after. -->

## Related to source code (for typings update)

<!-- List with permalink into source code to prove that changes are true. -->

## Checklist

- [ ] Only the lines required for the fix/feature are changed (no formatter sweeps, no drive-by refactors)
- [ ] Tests use real fixture round-trip (`wb.xlsx.load` / `writeBuffer`), not synthetic model objects, where possible
- [ ] Checked open PRs (`gh pr list --state open`) for conflicting changes to the same files
- [ ] (If serialization is touched) Output verified to open in Excel, or `soffice --headless` round-trip clean
- [ ] (If `--no-verify` was used to bypass the pre-commit hook) Reason explained above
- [ ] (If a major dep was bumped) Runtime smoke test described above
