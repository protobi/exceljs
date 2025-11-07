# Claude Instructions: ExcelJS Fork Management

This is a **curated fork** of ExcelJS maintained by Protobi. This document contains critical workflow instructions for managing this fork across Claude sessions.

## ⚠️ CRITICAL: Review Before Commit

**ALWAYS ask for user review before committing code changes.**

Do NOT commit automatically, even if:
- Tests pass
- Code looks good
- Changes seem minor

**Workflow:**
1. Make changes
2. Show user what changed (git diff or summary)
3. **Wait for explicit approval**
4. Then commit and push

The user may want to:
- Review the changes
- Test manually
- Make additional edits
- Change the approach

Only exception: purely documentary changes explicitly requested (and even then, confirm first).

## Version Management Strategy

### Version Number Format

Use semantic versioning with pre-release identifier:

```
4.4.0-protobi.1
│││└─ identifier  └─ sequential release counter
│││
││└─── patch
│└──── minor
└───── major
```

**Rules:**
- Base version matches upstream (e.g., `4.4.0` from exceljs/exceljs)
- Pre-release identifier is always `-protobi`
- Counter increments for each fork release (`.1`, `.2`, `.3`, etc.)
- When upstream releases new version (e.g., 4.5.0), reset counter: `4.5.0-protobi.1`

**Examples:**
```
4.4.0-protobi.1  ← First fork release based on upstream 4.4.0
4.4.0-protobi.2  ← Second fork release (still based on 4.4.0)
4.5.0-protobi.1  ← First fork release after syncing with upstream 4.5.0
```

### Why We MUST Bump Versions

**Critical:** npm only picks up changes from git dependencies when `package.json` version changes.

In consuming projects using:
```json
"exceljs": "git+https://***@github.com/protobi/exceljs.git"
```

npm compares the version in the repo's package.json with installed version. No version change = no update.

This has been verified through years of production use with Protobi packages.

### When to Bump Version

Bump version for:
- ✅ New features added to the fork
- ✅ Bug fixes in fork-specific code
- ✅ Adopted upstream PRs that add functionality
- ✅ Any change you want consuming projects to pick up

Do NOT bump for:
- ❌ Documentation-only changes (README, FORK.md, etc.)
- ❌ Internal tooling/CI changes
- ❌ Commits that will be reverted

## Release Process

When releasing a new fork version:

```bash
# 1. Update version in package.json
npm version prerelease --preid=protobi
# This creates: 4.4.0-protobi.2 (if current is 4.4.0-protobi.1)

# 2. Commit with descriptive message
git commit -m "Release v4.4.0-protobi.2: [Feature description]"

# 3. Create matching git tag
git tag -a v4.4.0-protobi.2 -m "Fork release v4.4.0-protobi.2

Features:
- [List features/fixes in this release]
- Reference issues: (#1, #2, etc.)
"

# 4. Push with tags
git push origin master --tags

# 5. Update FORK.md to document the release
```

## Git Remote Configuration

This fork has two remotes:

```bash
origin   → https://github.com/protobi/exceljs.git     # Your fork
upstream → https://github.com/exceljs/exceljs         # Original repo
```

Keep them configured this way. Verify with: `git remote -v`

## Submitting PRs to Upstream

**Critical Workflow:** When creating PRs to upstream, you MUST handle the version number.

### Option 1: Create Clean Branch (Recommended)

```bash
# 1. Identify commits to include (exclude fork infrastructure commits)
git log --oneline master

# 2. Create branch from point before fork-specific commits
git checkout -b upstream-pr/feature-name <commit-before-fork-changes>

# 3. Cherry-pick only feature commits
git cherry-pick <commit-1> <commit-2>

# 4. Reset package.json to upstream version
git checkout upstream/master -- package.json
git commit -m "Reset version to upstream for PR compatibility"

# 5. Verify tests pass
npm install
npm test

# 6. Push and create PR
git push origin upstream-pr/feature-name
gh pr create --repo exceljs/exceljs --base master
```

### Option 2: Manual Edit on PR Branch

```bash
# On your PR branch, edit package.json
# Change: "version": "4.4.0-protobi.1"
# To:     "version": "4.4.0"  (match upstream)
git add package.json
git commit -m "Reset version for upstream PR"
```

### What Makes a Clean Upstream PR

Include:
- ✅ Feature code changes
- ✅ Tests for the feature
- ✅ Documentation (API docs, usage examples)
- ✅ package.json at upstream version (4.4.0)

Exclude:
- ❌ Fork identity in README (the note linking to FORK.md is okay)
- ❌ FORK.md file
- ❌ Fork-specific CONTRIBUTING.md content
- ❌ Version bumps (4.4.0-protobi.X)

## Adopting Upstream PRs

When you find a valuable PR in upstream:

```bash
# 1. Fetch the PR
git fetch upstream pull/2850/head:pr-2850

# 2. Review changes
git log master..pr-2850
git diff master..pr-2850

# 3. Test it
git checkout pr-2850
npm install
npm test

# 4. If good, merge into master
git checkout master
git merge pr-2850 --no-ff -m "Adopt upstream PR #2850: [Description]"

# 5. Bump version since this is new functionality
npm version prerelease --preid=protobi

# 6. Push
git push origin master --tags
```

## Commit Message Format

Use conventional commits for clarity:

**For fork releases:**
```
Release v4.4.0-protobi.2: Add feature X

- Detailed description
- Reference issues: #1, #2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**For features:**
```
Add support for multiple pivot tables (#1)

[Detailed explanation]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**For upstream PRs:**
```
Adopt upstream PR #2850: [Feature name]

[Why we're adopting this]
Original PR: https://github.com/exceljs/exceljs/pull/2850

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Testing Before Release

Always run tests before bumping version:

```bash
npm install
npm test
```

If tests fail, fix them before releasing.

## Documentation Standards

When adding features:
1. **Code changes** - Implement the feature
2. **Tests** - Add comprehensive tests
3. **README.md** - Document API and usage with examples
4. **FORK.md** - Add to "Fork-Specific Features" list
5. **Limitations** - Document any limitations clearly

## Files and Their Purposes

- **README.md** - Main documentation, kept mostly upstream-compatible
- **FORK.md** - Fork identity, features list, maintainer workflows
- **CONTRIBUTING.md** - Contribution guidelines
- **package.json** - Version MUST use `-protobi.X` format
- **.claude/instructions.md** - This file (workflow reference)

## Quick Reference Commands

```bash
# Check fork status
git log upstream/master..master          # Commits ahead of upstream
git log master..upstream/master          # Commits behind upstream

# Sync with upstream
git fetch upstream
git merge upstream/master

# Create fork release
npm version prerelease --preid=protobi
git push origin master --tags

# View version history
git tag -l "v*-protobi*"
```

## Important Notes

- **Never publish to npm** - This fork is distributed via GitHub only
- **Keep README.md clean** - Minimal fork references for upstream PR compatibility
- **Version bumps are required** - npm dependency resolution depends on it
- **Test before release** - No exceptions
- **Document everything** - Future you will thank present you

## Questions?

Refer to:
- [FORK.md](../FORK.md) - Complete fork documentation and workflows
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- This file - Version and PR management

---

Last Updated: 2025-01-07
