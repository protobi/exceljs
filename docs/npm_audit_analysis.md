# npm audit Analysis

Last updated: 2025-12-14
Package version: @protobi/exceljs@4.4.0-protobi.6

## Summary

- **Total vulnerabilities:** 14 (as reported)
- **Unique root causes:** 5 packages
- **Production impact:** None (all vulnerabilities in dev/test dependencies only)
- **Critical:** 2 (dev only)
- **High:** 6 (dev only)
- **Moderate:** 2 (dev only)

## Status by Package

### 1. grunt-exorcise / exorcist / minimist

| Field | Value |
|-------|-------|
| **Alert** | Prototype Pollution in minimist (GHSA-vh95-rmgr-6w4m, GHSA-xvch-5gv4-984h) |
| **Stated Severity** | Critical (CVSS 9.8) |
| **Assessed Severity** | Low |
| **Dependency Chain** | grunt-exorcise (dev) → exorcist@1.0.1 → minimist@<0.2.4 |
| **Usage** | Build tool: extracts source maps from browserify bundles |
| **Exposure** | Development/build time only, not in published package |
| **Analysis** | minimist vulnerability allows prototype pollution via crafted CLI arguments. Since exorcist only runs during local builds (not user-facing), attack surface is limited to developer machines. Would require compromised build script or malicious npm script. |
| **Decision** | **ACCEPT RISK**: Dev-only tool. No fix available (exorcist unmaintained, last release 2017). Consider replacing with `exorcise` (different package) or inline source map generation if this becomes a concern. |
| **Mitigation** | Monitor for supply chain attacks. Review all npm scripts before running. |

---

### 2. puppeteer / puppeteer-core / tar-fs / ws

| Field | Value |
|-------|-------|
| **Alert** | Multiple: tar-fs path traversal (GHSA-vj76-c3g6-qr5v, GHSA-8cj5-5rvv-wf4v, GHSA-pq67-2wwv-3xjx), ws DoS (GHSA-3h5v-q93c-6h6q) |
| **Stated Severity** | High (CVSS 7.5) |
| **Assessed Severity** | Low |
| **Dependency Chain** | grunt-contrib-jasmine (dev) → puppeteer@19.11.1 → puppeteer-core → tar-fs@2.0.0-2.1.3, ws@8.0.0-8.17.0 |
| **Usage** | Browser test automation via Jasmine |
| **Exposure** | Development/test time only, not in published package |
| **Analysis** | **tar-fs**: Path traversal vulnerabilities when extracting malicious tarballs. Only triggered if puppeteer downloads a compromised Chrome binary. **ws**: DoS via excessive HTTP headers when running WebSocket server. Both require specific attack scenarios during test execution. Browser tests currently disabled (`.disable-test-browser` file exists). |
| **Decision** | **ACCEPT RISK**: Tests disabled. If re-enabled, upgrade puppeteer to v22+ or latest. Current priority is low since browser tests are non-functional and not required for releases. |
| **Mitigation** | Before re-enabling browser tests, run `npm audit fix` to update puppeteer. Verify Chrome download source integrity. |

---

### 3. watchify / chokidar / micromatch / braces / anymatch / readdirp

| Field | Value |
|-------|-------|
| **Alert** | ReDoS in braces (GHSA-grv7-fg5c-xmjg), micromatch (GHSA-952p-6rrq-rcjv) |
| **Stated Severity** | High (braces CVSS 7.5), Moderate (micromatch CVSS 5.3) |
| **Assessed Severity** | Low |
| **Dependency Chain** | grunt-browserify (dev) → watchify@3.11.1 → chokidar@2.x → braces@<3.0.3, micromatch@<4.0.8 |
| **Usage** | File watcher for live-reload during development with `grunt watch` |
| **Exposure** | Development time only, not in published package |
| **Analysis** | Regular Expression Denial of Service (ReDoS) triggered by crafted glob patterns. watchify/chokidar use these packages for file watching. Attack requires developer to watch a directory with maliciously named files (thousands of nested braces/wildcards). Unlikely in normal development. |
| **Decision** | **ACCEPT RISK**: Dev-only tool. Fix available via `npm audit fix` but may break compatibility with grunt-browserify@5.3.0. Not critical since live-reload is optional workflow (can use `npm run build` instead). |
| **Mitigation** | Avoid watching untrusted directories. If live-reload becomes critical, test `npm audit fix` compatibility or upgrade grunt-browserify. |

---

## Production Dependencies (No Vulnerabilities)

All 101 production dependencies are clean:
- `archiver@5.3.2` ✓
- `dayjs@1.8.34` ✓
- `fast-csv@4.3.1` ✓
- `jszip@3.10.1` ✓
- `readable-stream@3.6.0` ✓
- `saxes@5.0.1` ✓
- `tmp@0.2.0` ✓
- `unzipper@0.10.11` ✓
- `uuid@8.3.0` ✓
- `asn1.js@5.4.1` ✓ (overridden, fixed CSP issue)

## Historical Context

### 4.4.0-protobi.5 (2025-12-06)
- Upgraded mocha@7 → @11 (fixed ReDoS in transitive deps)
- Upgraded chai-xml@0.3 → @0.4 (fixed xml2js prototype pollution)
- Upgraded got@9 → @11 (security fixes)
- Reduced vulnerabilities from 38 → 15

### 4.4.0-protobi.6 (2025-12-14)
- Fixed asn1.js CSP violation (production code fix)
- Current vulnerabilities: 15 (all dev-only, 3 root causes)

## Recommendations

### Immediate (Priority: Low)
- Document browser test status and plan for re-enabling
- Consider if live-reload via watchify is worth maintaining

### Short-term (Next major version)
1. **Replace grunt-exorcise**: Switch to inline source maps or maintained alternative
   ```javascript
   // Option 1: Inline maps (no external tool needed)
   browserify: { options: { debug: true } }

   // Option 2: Use maintained exorcise package
   npm install exorcise  // different from grunt-exorcise
   ```

2. **Upgrade or remove puppeteer**: If browser tests needed, upgrade to v22+
   ```bash
   npm install --save-dev puppeteer@latest
   ```

3. **Update watchify toolchain**: Test compatibility with latest grunt-browserify
   ```bash
   npm audit fix --package-lock-only  # dry run
   ```

### Long-term (Future consideration)
- Evaluate migration from Grunt to modern build tools (Rollup, esbuild, Vite)
- Most npm audit issues stem from aging Grunt ecosystem
- Modern tools have smaller dependency trees and better maintenance

## Monitoring

- Run `npm audit` before each release
- Review Dependabot alerts weekly
- Update this document when vulnerability status changes
- Re-assess risk if any dev dependency is used in new production contexts

## References

- [npm audit documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [OWASP: Using Components with Known Vulnerabilities](https://owasp.org/www-project-top-ten/2017/A9_2017-Using_Components_with_Known_Vulnerabilities)
- [Upstream issue #2984](https://github.com/exceljs/exceljs/issues/2984) - Security vulnerabilities discussion
- [Upstream issue #3006](https://github.com/exceljs/exceljs/issues/3006) - glob 7.x dependency discussion
