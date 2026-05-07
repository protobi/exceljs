# AGENTS.md

Instructions for AI coding agents (Claude Code, Cursor, Codex, Copilot Workspace, etc.) opening pull requests against this repository.

Human contributors: see [CONTRIBUTING.md](CONTRIBUTING.md). The rules below also apply to any human submitting AI-generated code.

If you are an AI agent, read this file in full before making changes. The patterns below come from real PRs we have had to reject or rework.

---

## Hard rules

### 1. Surgical scope

- Touch ONLY the lines required for the fix or feature.
- Do NOT extract constants, rename variables, collapse `Promise.all`, rewrite `reduce` to `for`, or "clean up" surrounding code, even if your linter or style tool suggests it.
- If the pre-commit hook (prettier ↔ eslint conflict) fights you, commit with `--no-verify` and call this out in the PR description. Do NOT reshape unrelated code to satisfy the hook.

### 2. No formatter sweeps

- Do NOT run `npx prettier --write .`, `eslint --fix` on whole files, or any tool that rewrites files you did not otherwise change.
- Do NOT modify `.prettierrc`, `.eslintrc`, or other config files in a feature/bugfix PR. If a config change is needed, open a separate config-only PR.

### 3. PR description must be complete

- List EVERY file changed in the PR description, including configs, lockfiles, and incidental edits.
- If you used `--no-verify`, say so and explain why.
- If your change depends on or conflicts with another open PR, link it.

### 4. Tests must use real fixtures, not synthetic models

- For XLSX read/write fixes, your test MUST round-trip through `wb.xlsx.load(...)` and/or `wb.xlsx.writeBuffer(...)` against a real or minimal fixture file.
- Do NOT build hand-rolled model objects and call internal serializers (e.g. `XLSX.reconcile`, individual xforms) directly. Synthetic-model tests can pass while the real load/write path still breaks.
- Place fixture files under `spec/integration/data/` following existing naming.

### 5. Cross-check open PRs before submitting

- Before opening a PR, list the currently open PRs in this repo and verify your change does not touch the same files or overlap in scope. The maintainer has had three concurrent PRs all editing `.prettierrc` because none of them checked.
- Run: `gh pr list --state open --limit 50 --json number,title,files`

### 6. XLSX serialization changes must be Excel-verified

If your change touches anything that writes XLSX (xforms, sheet/workbook serialization, pivot tables, charts, comments, conditional formatting):

- Verify the output file actually opens in Excel without a "Repaired Records" warning, OR
- Round-trip with LibreOffice headless and inspect the bytes:
  ```bash
  soffice --headless --convert-to xlsx /tmp/your-output.xlsx --outdir /tmp/roundtrip
  unzip -p /tmp/roundtrip/your-output.xlsx xl/<relevant-part>.xml | head
  ```
- Unit tests do NOT catch Excel's repair warnings. This step is mandatory for serialization-touching PRs.

### 7. Dependency bumps require runtime smoke tests

- Major-version dep bumps (e.g. `fast-csv`, `unzipper`, `archiver`) MUST be smoke-tested against the runtime paths that use them, not just `npm test`.
- Streaming reader changes: load a real `.xlsx`. CSV writer changes: write and re-parse real CSV. Document the smoke test in the PR.

### 8. One concern per PR

- Bug fix + sibling bugs of the same shape in the same file: ONE PR. Good.
- Bug fix + unrelated cleanup + dep bump: THREE PRs. Required.
- If you find yourself touching `index.d.ts`, `README.md`, `package-lock.json`, etc. incidentally, stop and revert those edits unless they are the actual subject of the PR.

---

## Per-PR checklist (also in `.github/pull_request_template.md`)

Before opening the PR, verify:

- [ ] Only the lines required for the fix are changed
- [ ] No prettier/eslint sweeps on unrelated files
- [ ] Every file change is listed in the PR description below
- [ ] Tests use real fixture round-trip (`wb.xlsx.load` / `writeBuffer`), not synthetic models
- [ ] `gh pr list --state open` checked for conflicting PRs
- [ ] (If serialization) Output file opens in Excel or `soffice --headless` without warnings
- [ ] (If `--no-verify` used) Reason noted in PR description
- [ ] (If dep bump) Runtime smoke test described in PR

---

## Repository conventions

- Code style: enforced by ESLint + Prettier (the conflict above is real — live with it on a per-PR basis)
- Tests: Mocha, in `spec/unit/`, `spec/integration/`, `spec/end-to-end/`
- Run unit tests fast: `npm run test:unit` (skips the build step)
- Full suite: `npm test` (build + unit + integration + e2e + jasmine)
- Node target: see `engines` in `package.json`
- Browserify is in the build chain. Do NOT introduce dependencies that ship ES2021+ syntax (`??=`, `?.()`) in their CJS output, or that publish `exports`-only packages without a `main` field. Both break the browser bundle.

---

## What this fork is

This is a curated Protobi fork of [exceljs/exceljs](https://github.com/exceljs/exceljs). We selectively adopt upstream features for production use. We are NOT a general-purpose alternative fork. See [CONTRIBUTING.md](CONTRIBUTING.md) for what we accept.

If your change is a generic improvement that has not been merged upstream, consider opening it against [exceljs/exceljs](https://github.com/exceljs/exceljs) first.
