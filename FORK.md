# 🔱 About This Fork

This is a **curated fork** of [ExcelJS](https://github.com/exceljs/exceljs) maintained by [Protobi](https://github.com/protobi) with specific features cherry-picked from the upstream repository for production use.

**This is NOT a general-purpose maintained fork.** We add features WE need and test them in OUR environment. You're welcome to use this fork, but there are no support guarantees beyond what serves our own requirements.

## What This Means

- ✅ **Selective enhancements** - We merge features needed for our projects
- ✅ **Production tested** - Changes are battle-tested in real applications
- ✅ **Issues enabled** - Report bugs, but limited to features in this fork
- ⚠️ **No promise of ongoing maintenance** - We maintain what we use
- ⚠️ **No general support** - We can't be your Excel library support team
- 📝 **Contributions welcome** - PRs considered on a case-by-case basis (see [CONTRIBUTING.md](CONTRIBUTING.md))

## Fork-Specific Features

### Multiple Pivot Tables ([#1](../../issues/1))

Support for multiple pivot tables per workbook. The original implementation was limited to one pivot table per file.

**Status:** ✅ Implemented and tested
**Added:** 2025-01-07

See the [Pivot Tables](README.md#pivot-tables) section in the main README for documentation.

---

## Installation

If you want to use this fork instead of the upstream version:

```bash
npm install protobi/exceljs
```

Or in your package.json:
```json
{
  "dependencies": {
    "exceljs": "github:protobi/exceljs"
  }
}
```

## Upstream Repository

**Original:** [exceljs/exceljs](https://github.com/exceljs/exceljs)
**License:** MIT (same as upstream)
**Original Author:** Guyon Roche

We're grateful to the original maintainers and all contributors who built this excellent library.

## Contributing to This Fork

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- What types of contributions we accept
- How to propose adopting upstream PRs
- Code standards and testing requirements

## Why This Fork Exists

The upstream ExcelJS repository became largely dormant. Rather than attempting to become a general replacement (which would be a massive maintenance burden), we maintain this fork for specific features we need in production.

If the upstream becomes active again, we'd happily contribute changes back and potentially sunset this fork.
