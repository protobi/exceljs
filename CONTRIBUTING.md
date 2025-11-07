# Contributing to ExcelJS (Protobi Fork)

Thank you for your interest in contributing!

## About This Fork

This is a **curated fork** of ExcelJS maintained by Protobi. We selectively adopt features from the upstream repository that we need for our production systems.

**Important:** This is NOT a general-purpose community fork attempting to replace the upstream project. We maintain this fork to serve our specific needs.

## What We Accept

### ✅ We're likely to accept:

1. **Bug fixes** for features already in this fork
2. **Improvements** to fork-specific features (e.g., pivot tables)
3. **Well-tested, self-contained features** that:
   - Have clear use cases
   - Don't add significant maintenance burden
   - Come with tests and documentation
   - Are things we might actually use

### ⚠️ We'll consider carefully:

1. **Cherry-picked PRs from upstream** - Must be:
   - Well-reviewed and high quality
   - Thoroughly tested
   - Not rejected upstream for good reasons
   - Something we'll actually maintain

### ❌ We're unlikely to accept:

1. **Large refactors** - We're not rewriting the library
2. **Features we don't use** - We can't maintain what we don't use
3. **Breaking changes** - Stability matters for production
4. **Incomplete features** - Must be fully working, tested, and documented

## Before You Contribute

1. **Check existing issues** - Is this already being discussed?
2. **Open an issue first** - Discuss the change before writing code
3. **Keep it small** - Smaller PRs are easier to review and merge
4. **Test thoroughly** - Include tests and examples
5. **Document clearly** - Update README if adding features

## How to Contribute

### For Bug Fixes:

1. Fork the repository
2. Create a branch: `git checkout -b fix/description`
3. Make your changes with tests
4. Submit a PR with:
   - Clear description of the bug
   - How you fixed it
   - Test coverage

### For New Features:

1. **Open an issue FIRST** - Discuss before coding
2. Wait for feedback - We may decline features we won't maintain
3. If approved, follow the same process as bug fixes

### For Upstream PRs:

If you want us to adopt a PR from upstream:

1. Open an issue linking to the upstream PR
2. Explain why we should adopt it
3. Confirm it's been tested
4. Be prepared to help with integration if needed

## Code Standards

- Follow existing code style (enforced by ESLint/Prettier)
- Add tests for all changes
- Update documentation
- Keep commits clean and descriptive

## Testing

```bash
npm test
npm run test:coverage
```

## Questions?

Open an issue! But remember:
- This fork serves our production needs first
- We can't provide general Excel library support
- Response times may vary based on our workload

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Acknowledgments

Huge thanks to the original ExcelJS maintainers and contributors who built this excellent library.
