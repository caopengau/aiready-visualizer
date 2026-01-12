# Daily Workflow Guide

Quick reference for common development workflows in the AIReady monorepo.

## 🔄 Daily Development Workflow

### 1. Making Changes

```bash
# Work on code as normal
vim packages/context-analyzer/src/analyzer.ts

# Run tests
make test

# Fix any issues
make fix
```

### 2. Committing Changes

```bash
# Stage and commit
git add .
git commit -m "feat: improved context budget calculation"

# Sync everything (RECOMMENDED)
make push
```

**💡 What `make push` does:**
- Pushes monorepo to GitHub ✅
- Syncs ALL spoke repos automatically ✅
- Skips spokes with no changes ✅
- Keeps everything in sync effortlessly ✅

### 3. When to Sync

| Scenario | Command | Why |
|----------|---------|-----|
| After any commit | `make push` | Keep spoke repos current |
| Before releasing | `make push` | Ensure GitHub is up-to-date |
| After merging PRs | `make push` | Sync external contributions |
| End of day | `make push` | Keep everything synchronized |

## 📦 Release Workflow

### Check What Needs Publishing

```bash
make release-status
```

Output shows:
- `✓` - Already published (no action needed)
- `ahead` - Local is newer (ready to release)
- `new` - Not yet on npm (first release)

### Release a Single Spoke

```bash
# Patch release (bug fixes: 0.1.0 → 0.1.1)
make release-one SPOKE=context-analyzer TYPE=patch

# Minor release (new features: 0.1.0 → 0.2.0)
make release-one SPOKE=context-analyzer TYPE=minor

# Major release (breaking changes: 0.1.0 → 1.0.0)
make release-one SPOKE=context-analyzer TYPE=major
```

**This command does EVERYTHING:**
1. ✅ Bumps version in package.json
2. ✅ Commits the version change
3. ✅ Creates git tag
4. ✅ Builds the package
5. ✅ Publishes to npm
6. ✅ Syncs GitHub spoke repo
7. ✅ Pushes everything

### Release Multiple Spokes

```bash
# Release all spokes that changed
make release-all TYPE=patch
```

## 🎯 Command Quick Reference

### Sync & Push Commands

```bash
make push              # Push monorepo + sync all spokes (RECOMMENDED)
make sync              # Same as 'make push' (alias)
make deploy            # Same as 'make push' (alias)
make push-all          # Full name (same as above)
```

### Release Commands

```bash
make release-status    # Check versions (local vs npm)
make release-help      # Show release options
make release-one       # Release one spoke
make release-all       # Release all spokes
```

### Development Commands

```bash
make install           # Install dependencies
make build             # Build all packages
make test              # Run tests
make lint              # Check code quality
make fix               # Auto-fix linting issues
make clean             # Clean build artifacts
```

### Publishing Commands (Advanced)

```bash
make npm-check                            # Verify npm login
make npm-publish SPOKE=context-analyzer   # Publish to npm only
make publish SPOKE=context-analyzer       # Sync GitHub only
```

## 📊 Example Workflows

### Scenario 1: Daily Development

```bash
# Morning: Pull latest
git pull

# Work on features
vim packages/context-analyzer/src/analyzer.ts
make test

# Commit and sync
git add .
git commit -m "feat: add new metric"
make push  # ← Syncs everything!
```

### Scenario 2: Bug Fix Release

```bash
# Check status
make release-status

# Fix the bug
vim packages/context-analyzer/src/analyzer.ts
make test

# Commit
git add .
git commit -m "fix: resolve token estimation bug"
make push

# Release patch version
make release-one SPOKE=context-analyzer TYPE=patch
```

### Scenario 3: New Feature Release

```bash
# Develop feature
git checkout -b feature/new-metric
vim packages/context-analyzer/src/analyzer.ts
make test

# Commit to branch
git add .
git commit -m "feat: add cohesion score"
make push  # Syncs spoke repos

# Merge to main
git checkout main
git merge feature/new-metric
make push

# Release minor version
make release-one SPOKE=context-analyzer TYPE=minor
```

### Scenario 4: Multiple Package Changes

```bash
# Update core
vim packages/core/src/utils/metrics.ts

# Update dependent spokes
vim packages/context-analyzer/src/analyzer.ts
vim packages/pattern-detect/src/detector.ts

# Test everything
make test

# Commit
git add .
git commit -m "feat: improved metric calculations"
make push  # Syncs ALL affected spokes

# Release in order
make release-one SPOKE=core TYPE=minor
make release-one SPOKE=context-analyzer TYPE=minor
make release-one SPOKE=pattern-detect TYPE=minor
```

## 🎓 Best Practices

### ✅ DO

- **Run `make push` after every commit** - Keeps spoke repos current
- **Check `make release-status` before releasing** - Know what needs publishing
- **Test before pushing** - Run `make test` to catch issues early
- **Use semantic versioning** - patch/minor/major based on changes
- **Release core first** - If core changes, release before spokes

### ❌ DON'T

- **Don't use `npm publish` directly** - Use `make npm-publish` (handles workspace:* protocol)
- **Don't skip `make push`** - Spoke repos will drift out of sync
- **Don't release without testing** - Always run `make test` first
- **Don't forget status checks** - Use `make release-status` regularly
- **Don't release spokes before core** - Core changes need to be published first

## 🔍 Troubleshooting

### Spoke repos out of sync?

```bash
make push  # Re-syncs everything
```

### Need to publish just one spoke?

```bash
make publish SPOKE=context-analyzer
```

### Want to see what changed?

```bash
git log packages/context-analyzer/ --oneline
```

### Check if anything needs releasing?

```bash
make release-status
```

## 📚 Related Documentation

- [PUBLISHING.md](../PUBLISHING.md) - Complete publishing guide
- [DEVOPS_WORKFLOW.md](./DEVOPS_WORKFLOW.md) - Visual workflow diagrams
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) - Quick release reference
- [MAKEFILE.md](../MAKEFILE.md) - All available commands

---

**TL;DR**: After every commit, run `make push` to keep everything in sync. When ready to release, run `make release-one SPOKE=xxx TYPE=patch`.
