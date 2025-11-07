# Fork Status

This is a **temporary fork** of [exceljs/exceljs](https://github.com/exceljs/exceljs) maintained by Protobi.

## Why This Fork Exists

Upstream exceljs has 100+ open PRs, some over a year old. We needed these fixes for production use, so we:
1. Adopted well-tested upstream PRs
2. Added critical pivot table features
3. Published to npm for community benefit
4. **Submitted all changes back to upstream**

**🎯 Goal:** Sunset this fork once upstream merges our contributions.

---

## Status Tracking

### ✅ Features Already Submitted to Upstream (Waiting for Merge)

| Feature/Fix | Our Issue | Upstream PR | Status | Date |
|-------------|-----------|-------------|--------|------|
| Pivot table count metric | [#12](https://github.com/protobi/exceljs/issues/12) | [#2885](https://github.com/exceljs/exceljs/pull/2885) | ⏳ Open | Feb 2025 |
| Boolean XML parsing fix | [#18](https://github.com/protobi/exceljs/issues/18) | [#2851](https://github.com/exceljs/exceljs/pull/2851) | ⏳ Open | Nov 2024 |
| ExcelToDate validation | [#19](https://github.com/protobi/exceljs/issues/19) | [#2956](https://github.com/exceljs/exceljs/pull/2956) | ⏳ Open | Aug 2025 |
| DynamicFilter parsing | [#20](https://github.com/protobi/exceljs/issues/20) | [#2973](https://github.com/exceljs/exceljs/pull/2973) | ⏳ Open | Sep 2025 |
| SharedString fix | [#21](https://github.com/protobi/exceljs/issues/21) | [#2915](https://github.com/exceljs/exceljs/pull/2915) | ⏳ Open | Apr 2025 |
| Autofilter undefined guard | [#22](https://github.com/protobi/exceljs/issues/22) | [#2978](https://github.com/exceljs/exceljs/pull/2978) | ⏳ Open (partial) | Sep 2025 |

**Total:** 6 PRs adopted from upstream, waiting for official merge

### 📝 Fork-Specific Features (Submitted to Upstream)

| Feature/Fix | Our Issue | Upstream PR | Status | Date |
|-------------|-----------|-------------|--------|------|
| Multiple pivot tables support | [#5](https://github.com/protobi/exceljs/issues/5) | [#2995](https://github.com/exceljs/exceljs/pull/2995) | ⏳ Open | Nov 2025 |
| XML special character escaping | [#3](https://github.com/protobi/exceljs/issues/3) | [#2996](https://github.com/exceljs/exceljs/pull/2996) | ⏳ Open | Nov 2025 |
| Pivot table column width control | [#8](https://github.com/protobi/exceljs/issues/8) | [#2997](https://github.com/exceljs/exceljs/pull/2997) | ⏳ Open | Nov 2025 |

**Status:** All original contributions submitted, waiting for upstream review

### 🔒 Security & Maintenance

| Feature/Fix | Our Issue | Upstream PR | Status |
|-------------|-----------|-------------|--------|
| Add package-lock.json | [#10](https://github.com/protobi/exceljs/issues/10) | - | Fork-specific |
| Run npm audit fix | [#11](https://github.com/protobi/exceljs/issues/11) | - | Fork-specific |

**Status:** Security improvements for our fork deployment

---

## Installation

### This Fork (Current)

```bash
npm install @protobi/exceljs
```

### Official Package (Future)

Once upstream merges our changes:

```bash
npm install exceljs
```

---

## Migration Plan

### When to Switch Back to Official

Monitor these conditions:
1. Upstream releases version with our features
2. All critical PRs merged (#2885, #2915, etc.)
3. Our unique features submitted and merged

### How to Switch Back

```bash
# 1. Check if official version has our features
npm view exceljs version
# Compare against our version: 4.4.0-protobi.2

# 2. Review official changelog
npm view exceljs --json | jq .versions

# 3. Switch packages
npm uninstall @protobi/exceljs
npm install exceljs

# 4. No code changes needed - API compatible!
```

### Deprecation Process

When upstream catches up, we will:

1. **Add deprecation notice** to npm package
   ```bash
   npm deprecate @protobi/exceljs "Use official 'exceljs' package - our changes have been merged upstream"
   ```

2. **Update README** with migration instructions

3. **Archive repository** on GitHub

4. **Final release** pointing to official package

---

## Features Exclusive to This Fork

### 1. Multiple Pivot Tables from Same Source

**Why it matters:** Upstream only supports one pivot table per workbook. We support multiple pivot tables from the same source data with unique cache IDs.

**Code:**
```javascript
// ✅ Works in @protobi/exceljs
// ❌ Crashes in official exceljs

const worksheet1 = workbook.addWorksheet('Data');
worksheet1.addRows([/* data */]);

const worksheet2 = workbook.addWorksheet('Pivot1');
worksheet2.addPivotTable({ sourceSheet: worksheet1, /* ... */ });

const worksheet3 = workbook.addWorksheet('Pivot2');
worksheet3.addPivotTable({ sourceSheet: worksheet1, /* ... */ }); // Works!
```

**Files changed:**
- `lib/doc/pivot-table.js` - Unique cache IDs per pivot table
- `lib/xlsx/xform/book/workbook-xform.js` - Support multiple cache definitions

**Upstream status:** Ready to submit as PR

### 2. Pivot Table Count Metric

**Why it matters:** Count is a fundamental Excel pivot table aggregation. Upstream only supports sum.

**Code:**
```javascript
// ✅ Works in @protobi/exceljs
// ❌ Not available in official exceljs (yet)

worksheet.addPivotTable({
  sourceSheet: worksheet1,
  rows: ['Category'],
  columns: ['Region'],
  values: ['Sales'],
  metric: 'count', // 🎯 NEW!
});
```

**Files changed:**
- `lib/doc/pivot-table.js` - Accept count metric
- `lib/xlsx/xform/pivot-table/pivot-table-xform.js` - Generate XML with subtotal="count"

**Upstream status:** PR exists ([#2885](https://github.com/exceljs/exceljs/pull/2885)), adopted here

### 3. Enhanced Bug Fixes

See "Status Tracking" section above for 6 bug fixes adopted from upstream PRs.

---

## API Compatibility

This fork maintains **100% API compatibility** with official exceljs.

**What this means:**
- ✅ Drop-in replacement: `require('exceljs')` works identically
- ✅ All official features work exactly the same
- ✅ Additional features are opt-in (won't break existing code)
- ✅ Switching back to official requires zero code changes

**Version mapping:**
```
Official exceljs:     4.4.0
This fork:            4.4.0-protobi.2
                      └─┬─┘ └──┬───┘
                        │      └─── Fork version (increments with our changes)
                        └────────── Matches upstream base version
```

---

## Contributing

### For Bug Fixes & Features

Please contribute to **upstream exceljs**, not this fork!

- Upstream repo: https://github.com/exceljs/exceljs
- Upstream issues: https://github.com/exceljs/exceljs/issues
- Upstream discussions: https://github.com/exceljs/exceljs/discussions

### For Fork-Specific Issues

Only use our repo for:
- Issues with our specific features (#5, #8)
- Questions about migration
- Fork maintenance

Create issue: https://github.com/protobi/exceljs/issues

---

## Testing

This fork passes all upstream tests plus additional tests for our features.

```bash
# Run all tests
npm test

# Run pivot table tests specifically
npm run test:integration -- --grep "Pivot Tables"
```

**Test coverage:**
- ✅ All upstream tests (197 passing)
- ✅ Pivot table count metric tests
- ✅ Multiple pivot tables tests

---

## Release History

### 4.4.0-protobi.2 (2025-11-07)

**Added:**
- Pivot table count metric (upstream PR #2885)
- 5 bug fixes from upstream PRs

**Fixed:**
- Boolean XML attribute parsing (#2851)
- ExcelToDate validation (#2956)
- DynamicFilter parsing (#2973)
- WorkbookReader sharedString resolution (#2915)
- Autofilter undefined guard (#2978)

**Security:**
- Added package-lock.json
- Ran npm audit fix (reduced vulnerabilities)

### 4.4.0-protobi.1 (2025-11-06)

**Initial fork release:**
- Multiple pivot tables from same source
- XML special character escaping fixes
- Column width control for pivot tables

---

## Monitoring Upstream

We actively monitor upstream for:
1. **Our PRs being merged** - Track at https://github.com/exceljs/exceljs/pulls
2. **New releases** - Watch https://github.com/exceljs/exceljs/releases
3. **Breaking changes** - Review changelogs for compatibility

**Current watch list:**
- 6 adopted PRs awaiting merge (#2851, #2915, #2956, #2973, #2978, #2885)
- 3 original PRs awaiting merge (#2995, #2996, #2997)
- **Total: 9 PRs** submitted to upstream

**Update frequency:** Monthly check for upstream progress

---

## Support & Contact

- **Bug reports:** [GitHub Issues](https://github.com/protobi/exceljs/issues)
- **Questions:** [GitHub Discussions](https://github.com/protobi/exceljs/discussions)

For official exceljs support:
- Upstream discussions: https://github.com/exceljs/exceljs/discussions

---

## License

This fork maintains the same license as upstream exceljs: **MIT**

See [LICENSE](LICENSE)

---

**Last Updated:** 2025-11-07
**Watching:** 9 upstream PRs awaiting review/merge
**Status:** Active maintenance until upstream merge - All features submitted!
