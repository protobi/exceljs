# ExcelJS Upstream Pull Request Analysis

**Analysis Date:** 2025-11-07
**Repository:** exceljs/exceljs
**Total Open PRs:** 100
**Analysis Period:** July 2024 - November 2025

## Executive Summary

This analysis reviews all open pull requests in the upstream ExcelJS repository to identify candidates for adoption into our fork. PRs are classified by type, complexity, completeness, and community engagement to prioritize which changes would provide the most value.

### Key Findings

- **100 open PRs** spanning 16 months, indicating maintenance challenges in upstream
- **High-value targets:** 15-20 PRs with tests, clear bug fixes, or requested features
- **Quick wins:** 10-15 low-complexity bug fixes that could be adopted immediately
- **Community interest:** Several PRs have multiple comments indicating demand

### Classification Criteria

**Type:**
- **Feature:** New functionality (e.g., "feat:", "Add support for")
- **Bug:** Fixes for existing issues (e.g., "Fix", "Resolved")
- **Enhancement:** Improvements to existing features (e.g., "Update", "Improve", "optimize")
- **Maintenance:** Dependencies, documentation, refactoring

**Complexity:**
- **Low:** < 50 lines changed, < 3 files affected
- **Medium:** 50-200 lines changed, 3-6 files affected
- **High:** > 200 lines changed or > 6 files affected

**Completeness:**
- **Complete:** Includes unit tests and/or integration tests
- **Partial:** Has documentation or examples but no tests
- **Incomplete:** Code changes only, no tests or docs

**Salience (Community Interest):**
- **High:** 3+ comments
- **Medium:** 1-2 comments
- **Low:** 0 comments

---

## Priority Rankings

### Tier 1: High Priority (Adopt Soon)
Complete fixes with community interest and low complexity

| PR | Title | Type | Complexity | Completeness | Salience | Notes |
|----|-------|------|------------|--------------|----------|-------|
| [#2915](https://github.com/exceljs/exceljs/pull/2915) | WorkbookReader sharedString fix | Bug | Low | Incomplete | Medium | **Merged to fork** (Issue [#21](https://github.com/protobi/exceljs/issues/21)) |
| [#2973](https://github.com/exceljs/exceljs/pull/2973) | Fix dynamicFilter parsing in tables | Bug | Low | Incomplete | Low | **Merged to fork** (Issue [#20](https://github.com/protobi/exceljs/issues/20)) |
| [#2962](https://github.com/exceljs/exceljs/pull/2962) | Handle missing 'r' attribute | Bug | Medium | Complete | Low | Has tests, handles edge case |
| [#2978](https://github.com/exceljs/exceljs/pull/2978) | Fix undefined column autofilter | Bug | Low | Partial | Low | **Merged to fork** (Issue [#22](https://github.com/protobi/exceljs/issues/22)) |
| [#2956](https://github.com/exceljs/exceljs/pull/2956) | Fix dateToExcel() non-numeric | Bug | Low | Incomplete | Low | **Merged to fork** (Issue [#19](https://github.com/protobi/exceljs/issues/19)) |
| [#2851](https://github.com/exceljs/exceljs/pull/2851) | Fix boolean read val error | Bug | Low | Incomplete | Low | **Merged to fork** (Issue [#18](https://github.com/protobi/exceljs/issues/18)) |

### Tier 2: Medium Priority (Evaluate & Adopt)
Features or enhancements with tests or high community interest

| PR | Title | Type | Complexity | Completeness | Salience | Notes |
|----|-------|------|------------|--------------|----------|-------|
| [#2885](https://github.com/exceljs/exceljs/pull/2885) | Add 'count' metric for pivot table | Feature | Medium | Complete | Low | **Merged to fork** (Issue [#12](https://github.com/protobi/exceljs/issues/12)) |
| [#2903](https://github.com/exceljs/exceljs/pull/2903) | Add support for removing images | Feature | High | Complete | Low | Has extensive tests |
| [#2983](https://github.com/exceljs/exceljs/pull/2983) | Add ImageEditAs 'twoCell' option | Feature | Medium | Complete | Low | Image handling improvement |
| [#2991](https://github.com/exceljs/exceljs/pull/2991) | Add getFirstWorksheet() method | Feature | Medium | Complete | Low | Safe API addition |
| [#2876](https://github.com/exceljs/exceljs/pull/2876) | Fix error adding image | Bug | Medium | Complete | Medium | **Merged to fork** (Issue [#24](https://github.com/protobi/exceljs/issues/24)) |
| [#2920](https://github.com/exceljs/exceljs/pull/2920) | Optimize merge check performance | Enhancement | Low | Incomplete | Low | Performance improvement |

### Tier 3: Consider (Review Before Adopting)
High complexity or incomplete, but potentially valuable

| PR | Title | Type | Complexity | Completeness | Salience | Notes |
|----|-------|------|------------|--------------|----------|-------|
| [#2867](https://github.com/exceljs/exceljs/pull/2867) | Performance: styleCacheMode | Enhancement | High | Complete | Low | 3x performance, needs review |
| [#2891](https://github.com/exceljs/exceljs/pull/2891) | Dependencies bump + fixes | Maintenance | Medium | Partial | High | 4 comments, security updates |
| [#2849](https://github.com/exceljs/exceljs/pull/2849) | Web-native streams support | Feature | High | Complete | Medium | 1 comment, modern API |
| [#2924](https://github.com/exceljs/exceljs/pull/2924) | Fix Anchor positioning | Bug | High | Partial | Low | Large change, complex |
| [#2847](https://github.com/exceljs/exceljs/pull/2847) | Stream addImage support | Feature | High | Complete | Low | Tests included |

### Tier 4: Low Priority (Monitor)
Documentation, maintenance, or unclear value

| PR | Title | Type | Complexity | Completeness | Salience | Notes |
|----|-------|------|------------|--------------|----------|-------|
| [#2989](https://github.com/exceljs/exceljs/pull/2989) | Fix archiver dependency | Maintenance | Low | Incomplete | Medium | Security, but minimal change |
| [#2869](https://github.com/exceljs/exceljs/pull/2869) | Bump unzipper version | Maintenance | Low | Incomplete | Low | Dependency update |
| [#2912](https://github.com/exceljs/exceljs/pull/2912) | Fix Chinese docs typo | Maintenance | Low | Incomplete | Low | **Merged to fork** (commit 2d1ddcf) |
| [#2783](https://github.com/exceljs/exceljs/pull/2783) | Fix image embedding docs | Maintenance | Low | Incomplete | Low | **Merged to fork** (commit 30b9971) |
| [#2733](https://github.com/exceljs/exceljs/pull/2733) | Improve readme.md | Maintenance | Low | Incomplete | Low | **Merged to fork** (commit 8558d21) |
| [#2577](https://github.com/exceljs/exceljs/pull/2577) | Fix tabColor example | Maintenance | Low | Incomplete | Low | **Merged to fork** (commit af8abfc) |

---

## Detailed PR Analysis

### Bug Fixes (High Adoption Priority)

#### [#2915](https://github.com/exceljs/exceljs/pull/2915) - WorkbookReader sharedString Fix ✅ **MERGED**
- **Type:** Bug
- **Complexity:** Low (2 additions, 3 deletions, 1 file)
- **Completeness:** Incomplete (no tests)
- **Salience:** Medium (1 comment with user confirmation)
- **Value:** High - Fixes data corruption in streaming mode
- **Adoption Risk:** Low - Small, focused change
- **Status:** **Merged to fork** - See Issue [#21](https://github.com/protobi/exceljs/issues/21), commit daa210b

#### [#2962](https://github.com/exceljs/exceljs/pull/2962) - Handle Missing 'r' Attribute
- **Type:** Bug
- **Complexity:** Medium (69 additions, 0 deletions, 3 files)
- **Completeness:** Complete (includes spec and test xlsx)
- **Salience:** Low (0 comments)
- **Value:** Medium - Handles malformed Excel files
- **Adoption Risk:** Low - Has tests
- **Recommendation:** **ADOPT** - Well-tested edge case handler

#### [#2973](https://github.com/exceljs/exceljs/pull/2973) - Fix dynamicFilter Parsing ✅ **MERGED**
- **Type:** Bug
- **Complexity:** Low (3 additions, 0 deletions, 1 file)
- **Completeness:** Incomplete (no tests)
- **Salience:** Low (0 comments)
- **Value:** Medium - Fixes table filter parsing
- **Adoption Risk:** Low - Minimal change
- **Status:** **Merged to fork** - See Issue [#20](https://github.com/protobi/exceljs/issues/20), commit daa210b

#### [#2978](https://github.com/exceljs/exceljs/pull/2978) - Fix Undefined Column Autofilter ✅ **MERGED**
- **Type:** Bug
- **Complexity:** Low (13 additions, 1 deletion, 3 files)
- **Completeness:** Partial (has package.json update, unclear if tested)
- **Salience:** Low (0 comments)
- **Value:** Medium - Prevents undefined errors
- **Adoption Risk:** Medium - Need to verify fix
- **Status:** **Merged to fork** - See Issue [#22](https://github.com/protobi/exceljs/issues/22), commit daa210b

#### [#2956](https://github.com/exceljs/exceljs/pull/2956) - Fix dateToExcel() Non-Numeric ✅ **MERGED**
- **Type:** Bug
- **Complexity:** Low (1 addition, 0 deletions, 1 file)
- **Completeness:** Incomplete (no tests)
- **Salience:** Low (0 comments)
- **Value:** Medium - Input validation
- **Adoption Risk:** Low - One line change
- **Status:** **Merged to fork** - See Issue [#19](https://github.com/protobi/exceljs/issues/19), commit daa210b

#### [#2851](https://github.com/exceljs/exceljs/pull/2851) - Fix Boolean Read Error ✅ **MERGED**
- **Type:** Bug
- **Complexity:** Low (1 addition, 1 deletion, 1 file)
- **Completeness:** Incomplete (no tests)
- **Salience:** Low (0 comments)
- **Value:** Medium - Fixes parsing issue
- **Adoption Risk:** Low - Single line fix
- **Status:** **Merged to fork** - See Issue [#18](https://github.com/protobi/exceljs/issues/18), commit daa210b

#### [#2876](https://github.com/exceljs/exceljs/pull/2876) - Fix Image Addition Error ✅ **MERGED**
- **Type:** Bug
- **Complexity:** Medium (44 additions, 2 deletions, 3 files)
- **Completeness:** Complete (has integration test)
- **Salience:** Medium (1 comment requesting merge)
- **Value:** High - Fixes real user issue when reusing images
- **Adoption Risk:** Low - Has tests
- **Status:** **Merged to fork** - See Issue [#24](https://github.com/protobi/exceljs/issues/24), commit cdb3dad
- **What it fixes:** Wrong image references when same image added multiple times non-consecutively

---

### Features (Selective Adoption)

#### [#2885](https://github.com/exceljs/exceljs/pull/2885) - Add 'count' Metric for Pivot Tables ✅ **MERGED**
- **Type:** Feature
- **Complexity:** Medium (139 additions, 5 deletions, 4 files)
- **Completeness:** Complete (includes spec and test)
- **Salience:** Low (0 comments)
- **Value:** **VERY HIGH** - Extends our pivot table work!
- **Adoption Risk:** Low - We own this code area
- **Status:** **Merged to fork** - See Issue [#12](https://github.com/protobi/exceljs/issues/12), commit 521c379
- **Fork Benefit:** We're already maintaining pivot tables, this adds value

#### [#2991](https://github.com/exceljs/exceljs/pull/2991) - Add getFirstWorksheet() Method
- **Type:** Feature
- **Complexity:** Medium (76 additions, 0 deletions, 4 files)
- **Completeness:** Complete (includes unit tests and types)
- **Salience:** Low (0 comments)
- **Value:** Medium - Safe API for common pattern
- **Adoption Risk:** Low - Well-tested
- **Recommendation:** **ADOPT** - Low risk, useful utility

#### [#2903](https://github.com/exceljs/exceljs/pull/2903) - Add Image Removal Support
- **Type:** Feature
- **Complexity:** High (199 additions, 4 deletions, 6 files)
- **Completeness:** Complete (extensive integration tests)
- **Salience:** Low (0 comments)
- **Value:** Medium - Completes image API
- **Adoption Risk:** Medium - Large change
- **Recommendation:** **EVALUATE** - Useful but test thoroughly

#### [#2983](https://github.com/exceljs/exceljs/pull/2983) - Add ImageEditAs 'twoCell' Option
- **Type:** Feature
- **Complexity:** Medium (56 additions, 1 deletion, 4 files)
- **Completeness:** Complete (has integration test)
- **Salience:** Low (0 comments)
- **Value:** Medium - Image positioning control
- **Adoption Risk:** Low - Well-defined scope
- **Recommendation:** **ADOPT** - Useful feature with tests

---

### Enhancements (Evaluate Value)

#### [#2867](https://github.com/exceljs/exceljs/pull/2867) - Performance: styleCacheMode
- **Type:** Enhancement
- **Complexity:** High (757 additions, 41 deletions, 12 files)
- **Completeness:** Complete (has benchmark and tests)
- **Salience:** Low (0 comments)
- **Value:** High - Claims 3x performance improvement
- **Adoption Risk:** High - Large architectural change
- **Recommendation:** **EVALUATE CAREFULLY** - Benchmark in our use cases first
- **Notes:** Could be significant for style-heavy workbooks

#### [#2920](https://github.com/exceljs/exceljs/pull/2920) - Optimize Merge Check Performance
- **Type:** Enhancement
- **Complexity:** Low (10 additions, 8 deletions, 1 file)
- **Completeness:** Incomplete (no tests)
- **Salience:** Low (0 comments)
- **Value:** Medium - Performance for large sheets
- **Adoption Risk:** Medium - Algorithm change needs validation
- **Recommendation:** **TEST** - Benchmark before/after

#### [#2849](https://github.com/exceljs/exceljs/pull/2849) - Web-Native Streams Support
- **Type:** Enhancement
- **Complexity:** High (116 additions, 20 deletions, 7 files)
- **Completeness:** Complete (has tests)
- **Salience:** Medium (1 comment about OOM)
- **Value:** High - Modern API, browser compatibility
- **Adoption Risk:** High - Affects core streaming
- **Recommendation:** **MONITOR** - Important for future, but risky

#### [#2809](https://github.com/exceljs/exceljs/pull/2809) - Add Quote Prefix Feature
- **Type:** Enhancement
- **Complexity:** Medium (136 additions, 14 deletions, 9 files)
- **Completeness:** Partial (has escape test)
- **Salience:** Low (0 comments)
- **Value:** Low - Niche Excel feature
- **Adoption Risk:** Medium - Affects cell rendering
- **Recommendation:** **SKIP** - Low priority feature

---

### Maintenance (Low Priority for Fork)

#### [#2891](https://github.com/exceljs/exceljs/pull/2891) - Dependencies Bump + Fixes
- **Type:** Maintenance
- **Complexity:** Medium (36 additions, 35 deletions, 3 files)
- **Completeness:** Partial (package.json updates)
- **Salience:** High (4 comments, maintainability concerns)
- **Value:** Medium - Security and compatibility
- **Adoption Risk:** Medium - Could break things
- **Recommendation:** **EVALUATE** - Check for security issues

#### [#2989](https://github.com/exceljs/exceljs/pull/2989) - Fix Archiver Transitive Dependencies
- **Type:** Maintenance
- **Complexity:** Low (1 addition, 1 deletion, 1 file)
- **Completeness:** Incomplete (package.json only)
- **Salience:** Medium (2 comments from author)
- **Value:** Low - Security tooling issue
- **Adoption Risk:** Low - Version bump
- **Recommendation:** **SKIP** - Not urgent

#### [#2869](https://github.com/exceljs/exceljs/pull/2869) - Bump Unzipper Version
- **Type:** Maintenance
- **Complexity:** Low (2 additions, 2 deletions, 1 file)
- **Completeness:** Incomplete (package.json only)
- **Salience:** Low (0 comments)
- **Value:** Low - Dependency update
- **Adoption Risk:** Low - Version bump
- **Recommendation:** **SKIP** - Low priority

---

## Adoption Strategy

### Phase 1: Quick Wins (Week 1) ✅ **COMPLETED**
Adopt low-complexity bug fixes with clear value:
1. ✅ [#2915](https://github.com/exceljs/exceljs/pull/2915) - WorkbookReader sharedString fix (Issue [#21](https://github.com/protobi/exceljs/issues/21))
2. ✅ [#2973](https://github.com/exceljs/exceljs/pull/2973) - dynamicFilter parsing (Issue [#20](https://github.com/protobi/exceljs/issues/20))
3. ✅ [#2956](https://github.com/exceljs/exceljs/pull/2956) - dateToExcel() validation (Issue [#19](https://github.com/protobi/exceljs/issues/19))
4. ✅ [#2851](https://github.com/exceljs/exceljs/pull/2851) - Boolean read fix (Issue [#18](https://github.com/protobi/exceljs/issues/18))
5. ✅ [#2978](https://github.com/exceljs/exceljs/pull/2978) - Autofilter undefined fix (Issue [#22](https://github.com/protobi/exceljs/issues/22))

**Status:** Completed - All merged in commit daa210b
**Value:** Immediate stability improvements

### Phase 2: Pivot Table Enhancement (Week 2) ✅ **COMPLETED**
Adopt pivot table count metric:
1. ✅ [#2885](https://github.com/exceljs/exceljs/pull/2885) - Add 'count' metric for pivot tables (Issue [#12](https://github.com/protobi/exceljs/issues/12))

**Status:** Completed - Merged in commit 521c379
**Value:** High - extends our competitive advantage in pivot tables

### Phase 3: Tested Features (Weeks 3-4)
Adopt well-tested features:
1. [#2991](https://github.com/exceljs/exceljs/pull/2991) - getFirstWorksheet() method
2. [#2962](https://github.com/exceljs/exceljs/pull/2962) - Missing 'r' attribute handling
3. [#2876](https://github.com/exceljs/exceljs/pull/2876) - Image addition fix
4. [#2983](https://github.com/exceljs/exceljs/pull/2983) - ImageEditAs 'twoCell' option

**Effort:** 3-5 days
**Value:** API improvements and edge case handling

### Phase 4: Evaluate & Test (Month 2)
Review high-complexity changes:
1. [#2867](https://github.com/exceljs/exceljs/pull/2867) - Performance styleCacheMode (benchmark first)
2. [#2903](https://github.com/exceljs/exceljs/pull/2903) - Image removal support (test thoroughly)
3. [#2849](https://github.com/exceljs/exceljs/pull/2849) - Web streams (evaluate for future)

**Effort:** 1-2 weeks
**Value:** Significant but requires careful validation

---

## Risk Assessment

### Low Risk PRs (Safe to Adopt)
- Single-file, < 20 line changes
- Clear bug fixes with obvious solutions
- PRs with comprehensive tests
- **Count:** ~15 PRs

### Medium Risk PRs (Test Before Adopting)
- 20-100 line changes
- Multiple file modifications
- Partial test coverage
- **Count:** ~25 PRs

### High Risk PRs (Careful Review Required)
- > 100 line changes
- Architectural changes
- Performance optimizations (need benchmarking)
- No tests or unclear value
- **Count:** ~15 PRs

### Skip / Not Applicable
- Documentation-only changes (unless critical)
- Maintenance PRs (handle separately)
- Unclear or abandoned PRs
- **Count:** ~45 PRs

---

## Fork-Specific Considerations

### Our Strengths
We are actively maintaining:
- **Pivot tables** - We should adopt [#2885](https://github.com/exceljs/exceljs/pull/2885) (count metric)
- **Multiple pivot tables from same source** - Our recent fix
- **XML escaping** - Our recent fix
- **Column width control** - Our recent enhancement

### Complementary PRs
These PRs align with our fork's focus:
1. **[#2885](https://github.com/exceljs/exceljs/pull/2885)** - Pivot table count metric (HIGH PRIORITY)
2. **[#2867](https://github.com/exceljs/exceljs/pull/2867)** - Style performance (if we have style-heavy use cases)
3. **[#2920](https://github.com/exceljs/exceljs/pull/2920)** - Merge cell performance (if relevant to our users)

### Conflict Potential
PRs that might conflict with our changes:
- Any pivot table modifications (low risk, we're ahead)
- Worksheet relationship changes (might conflict with our tableNumber fix)

---

## Recommendations Summary

### Immediate Adoption (This Sprint) ✅ **COMPLETED**
1. ✅ [#2915](https://github.com/exceljs/exceljs/pull/2915) - WorkbookReader fix (Issue [#21](https://github.com/protobi/exceljs/issues/21))
2. ✅ [#2885](https://github.com/exceljs/exceljs/pull/2885) - Pivot count metric (**HIGH VALUE**) (Issue [#12](https://github.com/protobi/exceljs/issues/12))
3. ✅ [#2973](https://github.com/exceljs/exceljs/pull/2973) - dynamicFilter fix (Issue [#20](https://github.com/protobi/exceljs/issues/20))
4. ✅ [#2956](https://github.com/exceljs/exceljs/pull/2956) - dateToExcel() fix (Issue [#19](https://github.com/protobi/exceljs/issues/19))
5. ✅ [#2851](https://github.com/exceljs/exceljs/pull/2851) - Boolean fix (Issue [#18](https://github.com/protobi/exceljs/issues/18))

**Status:** All merged to fork (commits 521c379, daa210b)
**Value:** High - stability + pivot enhancement

### Short-term Adoption (Next Month)
1. [#2991](https://github.com/exceljs/exceljs/pull/2991) - getFirstWorksheet()
2. [#2962](https://github.com/exceljs/exceljs/pull/2962) - Missing 'r' attribute
3. ✅ [#2876](https://github.com/exceljs/exceljs/pull/2876) - Image addition fix (Issue [#24](https://github.com/protobi/exceljs/issues/24))
4. ✅ [#2978](https://github.com/exceljs/exceljs/pull/2978) - Autofilter fix (Issue [#22](https://github.com/protobi/exceljs/issues/22))
5. [#2983](https://github.com/exceljs/exceljs/pull/2983) - ImageEditAs option

**Status:** 2/5 completed
**Estimated Value:** Medium - API improvements

### Evaluate for Future (Next Quarter)
1. [#2867](https://github.com/exceljs/exceljs/pull/2867) - Style performance (benchmark required)
2. [#2903](https://github.com/exceljs/exceljs/pull/2903) - Image removal
3. [#2849](https://github.com/exceljs/exceljs/pull/2849) - Web streams
4. [#2920](https://github.com/exceljs/exceljs/pull/2920) - Merge performance

**Estimated Effort:** 2-4 weeks
**Estimated Value:** Potentially high, needs validation

---

## Process Guidelines

### Before Adopting Any PR

1. **Create GitHub Issue**
   - Document what problem the PR solves
   - Reference upstream PR number
   - Note any modifications needed

2. **Review Code Quality**
   - Check for security issues
   - Verify code style matches our fork
   - Look for potential conflicts

3. **Test Coverage**
   - If PR has no tests, add them
   - Run existing test suite
   - Add integration tests for complex changes

4. **Documentation**
   - Update README.md if API changes
   - Update FORK.md to list adopted PR
   - Document any modifications we made

5. **Commit Message**
   - Use format: `Adopt upstream PR #XXXX: Description`
   - Reference our issue number: `Update #N`
   - Credit original author in commit

### Example Workflow

```bash
# 1. Create issue documenting the adoption
gh issue create --repo protobi/exceljs --title "Adopt upstream PR [#2885](https://github.com/exceljs/exceljs/pull/2885): Add count metric for pivot tables"

# 2. Create branch
git checkout -b adopt-upstream-2885

# 3. Cherry-pick or manually apply changes
# Review and modify as needed

# 4. Add tests if missing
# Run test suite

# 5. Commit with proper reference
git commit -m "Update #6 Adopt upstream PR [#2885](https://github.com/exceljs/exceljs/pull/2885): Add count metric for pivot tables

Adds 'count' as an additional metric option for pivot tables alongside
existing 'sum' metric. Includes comprehensive tests.

Original PR: https://github.com/exceljs/exceljs/pull/2885
Original Author: @dsilva01

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: dsilva01 <original-email@example.com>"

# 6. Test and push
npm test
git push origin adopt-upstream-2885

# 7. Document in FORK.md
```

---

## Appendix: Complete PR List

### All 100 Open PRs by Category

**High Priority - Bug Fixes (6)**
- ✅ [#2915](https://github.com/exceljs/exceljs/pull/2915) (merged), ✅ [#2973](https://github.com/exceljs/exceljs/pull/2973) (merged), [#2962](https://github.com/exceljs/exceljs/pull/2962), ✅ [#2978](https://github.com/exceljs/exceljs/pull/2978) (merged), ✅ [#2956](https://github.com/exceljs/exceljs/pull/2956) (merged), ✅ [#2851](https://github.com/exceljs/exceljs/pull/2851) (merged)

**Medium Priority - Features (5)**
- ✅ [#2885](https://github.com/exceljs/exceljs/pull/2885) (merged), [#2991](https://github.com/exceljs/exceljs/pull/2991), [#2903](https://github.com/exceljs/exceljs/pull/2903), [#2983](https://github.com/exceljs/exceljs/pull/2983), ✅ [#2876](https://github.com/exceljs/exceljs/pull/2876) (merged)

**Medium Priority - Enhancements (4)**
- [#2867](https://github.com/exceljs/exceljs/pull/2867), [#2920](https://github.com/exceljs/exceljs/pull/2920), [#2849](https://github.com/exceljs/exceljs/pull/2849), [#2847](https://github.com/exceljs/exceljs/pull/2847)

**Low Priority - Maintenance (10)**
- [#2989](https://github.com/exceljs/exceljs/pull/2989), [#2891](https://github.com/exceljs/exceljs/pull/2891), [#2869](https://github.com/exceljs/exceljs/pull/2869), [#2912](https://github.com/exceljs/exceljs/pull/2912), [#2783](https://github.com/exceljs/exceljs/pull/2783), [#2930](https://github.com/exceljs/exceljs/pull/2930), [#2752](https://github.com/exceljs/exceljs/pull/2752), [#2744](https://github.com/exceljs/exceljs/pull/2744), [#2812](https://github.com/exceljs/exceljs/pull/2812), [#2807](https://github.com/exceljs/exceljs/pull/2807)

**Under Review - Complex Changes (10)**
- [#2924](https://github.com/exceljs/exceljs/pull/2924), [#2781](https://github.com/exceljs/exceljs/pull/2781), [#2809](https://github.com/exceljs/exceljs/pull/2809), [#2803](https://github.com/exceljs/exceljs/pull/2803), [#2800](https://github.com/exceljs/exceljs/pull/2800), [#2791](https://github.com/exceljs/exceljs/pull/2791), [#2852](https://github.com/exceljs/exceljs/pull/2852), [#2846](https://github.com/exceljs/exceljs/pull/2846), [#2874](https://github.com/exceljs/exceljs/pull/2874), [#2894](https://github.com/exceljs/exceljs/pull/2894)

**Skip / Low Value (65)**
- Various documentation fixes, minor tweaks, unclear PRs, or duplicates

---

## Community Fork Contributions

### Adopted from rmartin93/exceljs-fork

#### Table addRow() Fix ✅ **MERGED**
- **Source:** https://github.com/rmartin93/exceljs-fork (commit 6b77cea)
- **Discussion:** https://github.com/exceljs/exceljs/discussions/2987
- **Value:** **CRITICAL** - Fixes getTable().addRow() workflow for template-based use cases
- **What it fixes:**
  - "Cannot read properties of undefined (reading 'length')" error
  - Missing worksheet references in loaded tables
  - Table references not expanding dynamically
  - Excel filter buttons disappearing after save
- **Status:** **Merged to fork** - See Issue [#23](https://github.com/protobi/exceljs/issues/23), commit cc6912e
- **Upstream status:** Preparing PR submission

## Next Steps

1. ✅ ~~**Create tracking issues** for Tier 1 PRs in our fork~~ (Completed: Issues [#12](https://github.com/protobi/exceljs/issues/12), #18-22)
2. ✅ ~~**Assign priority** based on user needs and fork roadmap~~ (Completed)
3. ✅ ~~**Begin adoption** with Phase 1 quick wins~~ (Completed: 6 PRs merged)
4. ✅ ~~**Adopt community fork contributions**~~ (Completed: rmartin93's table addRow fix)
5. **Monitor upstream** for new PRs and merged changes
6. **Update this document** quarterly or when significant PRs appear
7. **Proceed with Phase 3** - Adopt tested features ([#2991](https://github.com/exceljs/exceljs/pull/2991), [#2962](https://github.com/exceljs/exceljs/pull/2962), [#2876](https://github.com/exceljs/exceljs/pull/2876), [#2983](https://github.com/exceljs/exceljs/pull/2983))

---

**Document Maintained By:** ExcelJS Fork Team (Protobi)
**Last Updated:** 2025-11-07
**Next Review:** 2026-02-07
