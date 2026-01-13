# @aiready/pattern-detect

> **Semantic duplicate pattern detection for AI-generated code**

When AI tools generate code without awareness of existing patterns in your codebase, you end up with semantically similar but syntactically different implementations. This tool finds those patterns and quantifies their cost.

## 🎯 Why This Tool?

### The AI Code Problem

AI coding assistants (GitHub Copilot, ChatGPT, Claude) generate functionally similar code in different ways because:
- No awareness of existing patterns in your codebase
- Different AI models have different coding styles
- Team members use AI tools with varying contexts
- AI can't see your full codebase (context window limits)

### What Makes Us Different?

| Feature | jscpd | @aiready/pattern-detect |
|---------|-------|------------------------|
| Detection Method | Byte-level exact matching | Semantic similarity |
| Pattern Types | Generic blocks | Categorized (API, validators, utils, etc.) |
| Token Cost | ❌ No | ✅ Yes - shows AI context waste |
| Refactoring Suggestions | ❌ Generic | ✅ Specific to pattern type |
| Output Formats | Text/JSON | Console/JSON/HTML with rich formatting |

#### How We Differ (and When to Use Each)

- **Semantic intent vs exact clones**: jscpd flags copy-paste or near-duplicates; we detect functionally similar code even when structure differs (e.g., two API handlers with different frameworks).
- **Pattern typing**: We classify duplicates into `api-handler`, `validator`, `utility`, `component`, etc., so teams can prioritize coherent refactors.
- **AI context cost**: We estimate tokens wasted to quantify impact on AI tools (larger context, higher cost, more confusion).
- **Refactoring guidance**: We propose targeted fixes per pattern type (e.g., extract middleware or create base handler).
- **Performance profile**: We use Jaccard similarity with candidate filtering; ~2–3s for ~500 blocks on medium repos.

Recommended workflow:
- Run **jscpd** in CI to enforce low clone percentage (blocking).
- Run **@aiready/pattern-detect** to surface semantic duplicates and token waste (advisory), feeding a refactoring backlog.
- Use both for comprehensive hygiene: jscpd for exact clones; AIReady for intent-level duplication that AI tends to reintroduce.

## 🚀 Installation

```bash
npm install -g @aiready/pattern-detect

# Or use directly with npx
npx @aiready/pattern-detect ./src
```

## 📊 Usage

### CLI

```bash
# Basic usage
aiready-patterns ./src

# Adjust sensitivity
aiready-patterns ./src --similarity 0.9

# Only look at larger patterns
aiready-patterns ./src --min-lines 10

# Filter by severity (focus on critical issues first)
aiready-patterns ./src --severity critical  # Only >95% similar
aiready-patterns ./src --severity high      # Only >90% similar
aiready-patterns ./src --severity medium    # Only >80% similar

# Include test files (excluded by default)
aiready-patterns ./src --include-tests

# Memory optimization for large codebases
aiready-patterns ./src --max-blocks 1000 --batch-size 200

# Export to JSON
aiready-patterns ./src --output json --output-file report.json

# Generate HTML report
aiready-patterns ./src --output html
```

#### Presets (quick copy/paste)

```bash
# Speed-first (large repos)
aiready-patterns ./src \
  --min-shared-tokens 12 \
  --max-candidates 60 \
  --max-blocks 300

# Coverage-first (more findings)
aiready-patterns ./src \
  --min-shared-tokens 6 \
  --max-candidates 150

# Short-block focus (helpers/utilities)
aiready-patterns ./src \
  --min-lines 5 \
  --min-shared-tokens 6 \
  --max-candidates 120 \
  --exclude "**/test/**"

# Deep dive with streaming (comprehensive detection)
aiready-patterns ./src \
  --no-approx \
  --stream-results
```

### Configuration

Create an `aiready.json` or `aiready.config.json` file in your project root to persist settings:

```json
{
  "scan": {
    "include": ["**/*.{ts,tsx,js,jsx}"],
    "exclude": ["**/test/**", "**/*.test.*"]
  },
  "tools": {
    "pattern-detect": {
      "minSimilarity": 0.5,
      "minLines": 8,
      "approx": false,
      "batchSize": 200,
      "severity": "high",
      "includeTests": false
    }
  }
}
```

CLI options override config file settings.

### Programmatic API

```typescript
import { analyzePatterns, generateSummary } from '@aiready/pattern-detect';

const results = await analyzePatterns({
  rootDir: './src',
  minSimilarity: 0.85, // 85% similar
  minLines: 5,
  include: ['**/*.ts', '**/*.tsx'],
  exclude: ['**/*.test.ts', '**/node_modules/**'],
});

const summary = generateSummary(results);

console.log(`Found ${summary.totalPatterns} duplicate patterns`);
console.log(`Token cost: ${summary.totalTokenCost} tokens wasted`);
console.log(`Pattern breakdown:`, summary.patternsByType);
```

## 🔍 Real-World Example

### Before Analysis

Two API handlers that were written by AI on different days:

```typescript
// File: src/api/users.ts
app.get('/api/users/:id', async (request, response) => {
  const user = await db.users.findOne({ id: request.params.id });
  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }
  response.json(user);
});

// File: src/api/posts.ts
router.get('/posts/:id', async (req, res) => {
  const post = await database.posts.findOne({ id: req.params.id });
  if (!post) {
    res.status(404).send({ message: 'Post not found' });
    return;
  }
  res.json(post);
});
```

### Analysis Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PATTERN ANALYSIS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Files analyzed: 47
⚠  Duplicate patterns found: 23
💰 Token cost (wasted): 8,450

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PATTERNS BY TYPE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 api-handler      12
✓  validator        8
🔧 utility          3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TOP DUPLICATE PATTERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 87% 🌐 api-handler
   src/api/users.ts:15
   ↔ src/api/posts.ts:22
   432 tokens wasted

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CRITICAL ISSUES (>95% similar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

● src/utils/validators.ts:15
  validator pattern 97% similar to src/utils/checks.ts (125 tokens wasted)
  → Consolidate validation logic into shared schema validators (Zod/Yup) (CRITICAL: Nearly identical code)
```

### Suggested Refactoring

Create a generic handler:

```typescript
// utils/apiHandler.ts
export const createResourceHandler = (resourceName: string, findFn: Function) => {
  return async (req: Request, res: Response) => {
    const item = await findFn({ id: req.params.id });
    if (!item) {
      return res.status(404).json({ error: `${resourceName} not found` });
    }
    res.json(item);
  };
};

// src/api/users.ts
app.get('/api/users/:id', createResourceHandler('User', db.users.findOne));

// src/api/posts.ts
router.get('/posts/:id', createResourceHandler('Post', database.posts.findOne));
```

**Result:** Reduced from 432 tokens to ~100 tokens in AI context.

## ⚙️ Configuration

### Common Options

| Option | Description | Default |
|--------|-------------|---------|
| `minSimilarity` | Similarity threshold (0-1). Default `0.40` (Jaccard). Raise for only obvious duplicates; lower to catch more | `0.40` |
| `minSimilarity` | Similarity threshold (0-1). Default `0.40` (Jaccard). Raise for only obvious duplicates; lower to catch more | `0.40` |
| `minLines` | Minimum lines to consider a pattern | `5` |
| `maxBlocks` | Maximum code blocks to analyze (prevents OOM) | `500` |
| `include` | File patterns to include | `['**/*.{ts,tsx,js,jsx,py,java}']` |
| `exclude` | File patterns to exclude | See below |

### Exclude Patterns (Default)

By default, these patterns are excluded:
```bash
# Dependencies
**/node_modules/**

# Build outputs
**/dist/**, **/build/**, **/out/**, **/output/**, **/target/**, **/bin/**, **/obj/**

# Framework-specific build dirs
**/.next/**, **/.nuxt/**, **/.vuepress/**, **/.cache/**, **/.turbo/**

# Test and coverage
**/coverage/**, **/.nyc_output/**, **/.jest/**

# Version control and IDE
**/.git/**, **/.svn/**, **/.hg/**, **/.vscode/**, **/.idea/**, **/*.swp, **/*.swo

# Build artifacts and minified files
**/*.min.js, **/*.min.css, **/*.bundle.js, **/*.tsbuildinfo

# Logs and temporary files
**/logs/**, **/*.log, **/.DS_Store
```

Override with `--exclude` flag:
```bash
# Exclude test files and generated code
aiready-patterns ./src --exclude "**/test/**,**/generated/**,**/__snapshots__/**"

# Add to defaults (comma-separated)
aiready-patterns ./src --exclude "**/node_modules/**,**/dist/**,**/build/**,**/*.spec.ts"
```

## 📈 Understanding the Output

### Severity Levels

- **CRITICAL (>95% similar)**: Nearly identical code - refactor immediately
- **MAJOR (>90% similar)**: Very similar - refactor soon
- **MINOR (>85% similar)**: Similar - consider refactoring

### Pattern Types

- **🌐 api-handler**: REST API endpoints, route handlers
- **✓ validator**: Input validation, schema checks
- **🔧 utility**: Pure utility functions
- **📦 class-method**: Class methods with similar logic
- **⚛️ component**: UI components (React, Vue, etc.)
- **ƒ function**: Generic functions

### Token Cost

Estimated tokens wasted when AI tools process duplicate code:
- Increases context window usage
- Higher API costs for AI-powered tools
- Slower analysis and generation
- More potential for AI confusion

## 🎓 Best Practices

1. **Run regularly**: Integrate into CI/CD to catch new duplicates early
2. **Start with high similarity**: Use `--similarity 0.9` to find obvious wins
3. **Focus on critical issues**: Fix >95% similar patterns first
4. **Use pattern types**: Prioritize refactoring by category (API handlers → validators → utilities)
5. **Export reports**: Generate HTML reports for team reviews

## ⚠️ Performance & Memory

### Algorithm Complexity

**Jaccard Similarity**: **O(B × C × T)** where:
- B = number of blocks
- C = average candidates per block (~100)  
- T = average tokens per block (~50)
- **O(T) per comparison** instead of O(N²)
- **Default threshold: 0.40** (comprehensive detection including tests and helpers)

### Performance Benchmarks

| Repo Size | Blocks | Analysis Time |
|-----------|--------|--------------|
| Small (<100 files) | ~50 | <1s |
| Medium (100-500 files) | ~500 | ~2s |
| Large (500+ files) | ~500 (capped) | ~2s |

**Example:** 828 code blocks → limited to 500 → **2.4s** analysis time

### Tuning Options

```bash
# Default (40% threshold - comprehensive detection)
aiready-patterns ./src

# Higher threshold for only obvious duplicates
aiready-patterns ./src --similarity 0.65

# Lower threshold for more potential duplicates
aiready-patterns ./src --similarity 0.55

# Approximate mode is default (fast, with candidate filtering)
aiready-patterns ./src

# Exact mode with progress tracking (shows % and ETA)
aiready-patterns ./src --no-approx --stream-results

# Maximum speed (aggressive filtering)
aiready-patterns ./src --min-shared-tokens 12 --min-lines 10
```

## 🎛️ Tuning Playbook

Use these presets to quickly balance precision, recall, and runtime:

- Speed-first (large repos):
  - `aiready-patterns ./src --min-shared-tokens 12 --max-candidates 60 --max-blocks 300`
  - Cuts weak candidates early; best for fast, iterative scans.

- Coverage-first (more findings):
  - `aiready-patterns ./src --min-shared-tokens 6 --max-candidates 150`
  - Expands candidate pool; expect more results and longer runtime.

- Short-block focus (helpers/utilities):
  - `aiready-patterns ./src --min-lines 5 --min-shared-tokens 6 --max-candidates 120`
  - Better recall for small functions; consider `--exclude "**/test/**"` to reduce noise.

### Minimum Lines vs Min Shared Tokens

- `minLines` filters which blocks are extracted; lower values include smaller functions that have fewer tokens overall.
- Smaller blocks naturally share fewer tokens; to avoid missing true matches when `minLines` is low (≤5–6), consider lowering `minSharedTokens` by 1–2.
- Recommended pairs:
  - `minLines 5–6` → `minSharedTokens 6–8` (recall-friendly; watch noise)
  - `minLines 8–10` → `minSharedTokens 8–10` (precision-first)
- Default balance: `minLines=5`, `minSharedTokens=8` works well for most repos. Reduce `minSharedTokens` only when you specifically want to catch more short helpers.

## 🎯 Parameter Tuning Guide

### When You Get Too Few Results

If the tool finds fewer duplicates than expected, try these adjustments in order:

**1. Lower similarity threshold** (most effective)
```bash
# Default: 0.4, try lowering to find more potential duplicates
aiready-patterns ./src --similarity 0.3    # More sensitive
aiready-patterns ./src --similarity 0.2    # Very sensitive (may include noise)
```
*Tradeoff: More results but potentially more false positives*

**2. Reduce minimum lines**
```bash
# Default: 5, try lowering to catch smaller functions/utilities
aiready-patterns ./src --min-lines 3        # Include very small functions
aiready-patterns ./src --min-lines 1        # Include almost everything
```
*Tradeoff: More results but slower analysis and more noise*

**3. Lower shared tokens threshold**
```bash
# Default: 8, try lowering to expand candidate pool
aiready-patterns ./src --min-shared-tokens 5  # More candidates
aiready-patterns ./src --min-shared-tokens 3  # Many more candidates
```
*Tradeoff: More results but slower analysis*

**4. Include test files**
```bash
aiready-patterns ./src --include-tests
```
*Tradeoff: More results but may include test-specific patterns*

**5. Increase max candidates per block**
```bash
# Default: 100, try increasing for more thorough search
aiready-patterns ./src --max-candidates 200  # More thorough
```
*Tradeoff: Slower analysis but more comprehensive*

### When Analysis is Too Slow

If the tool takes too long to run, try these optimizations in order:

**1. Increase minimum lines** (most effective)
```bash
# Default: 5, try increasing to focus on substantial functions
aiready-patterns ./src --min-lines 10       # Focus on larger functions
aiready-patterns ./src --min-lines 15       # Only major functions
```
*Tradeoff: Faster but may miss small but important duplicates*

**2. Increase shared tokens threshold**
```bash
# Default: 8, try increasing to reduce candidate pool
aiready-patterns ./src --min-shared-tokens 12  # Fewer candidates
aiready-patterns ./src --min-shared-tokens 15  # Much fewer candidates
```
*Tradeoff: Faster but may miss some duplicates*

**3. Reduce max candidates per block**
```bash
# Default: 100, try reducing for faster analysis
aiready-patterns ./src --max-candidates 50   # Faster
aiready-patterns ./src --max-candidates 20   # Much faster
```
*Tradeoff: Faster but may miss some duplicates*

**4. Increase similarity threshold**
```bash
# Default: 0.4, try increasing to reduce comparisons
aiready-patterns ./src --similarity 0.6     # Fewer but more obvious duplicates
```
*Tradeoff: Faster but fewer results*

**5. Analyze by module/directory**
```bash
# Instead of analyzing the entire repo, analyze specific directories
aiready-patterns ./src/api --min-lines 8
aiready-patterns ./src/components --min-lines 8
```
*Tradeoff: Need to run multiple commands but each is faster*

### When You Get Too Many False Positives

If the results include many irrelevant duplicates:

**1. Increase similarity threshold**
```bash
# Default: 0.4, try increasing for more accurate matches
aiready-patterns ./src --similarity 0.6     # More accurate
aiready-patterns ./src --similarity 0.8     # Very accurate
```
*Tradeoff: Fewer results but higher quality*

**2. Increase minimum lines**
```bash
# Default: 5, try increasing to focus on substantial duplicates
aiready-patterns ./src --min-lines 10       # Larger patterns only
```
*Tradeoff: Fewer results but more significant ones*

**3. Use severity filtering**
```bash
aiready-patterns ./src --severity high      # Only >90% similar
aiready-patterns ./src --severity critical  # Only >95% similar
```
*Tradeoff: Fewer results but highest quality*

**4. Exclude specific patterns**
```bash
# Exclude generated files, migrations, etc.
aiready-patterns ./src --exclude "**/migrations/**,**/generated/**"
```
*Tradeoff: Fewer results but more relevant ones*

### Quick Troubleshooting Reference

| Problem | Symptom | Solution | Tradeoff |
|---------|---------|----------|----------|
| **No results** | "No duplicate patterns detected" | Lower `--similarity` to 0.3 | More noise |
| **Few results** | <5 duplicates found | Lower `--min-lines` to 3 | Slower analysis |
| **Too slow** | Takes >30 seconds | Increase `--min-lines` to 10 | Misses small duplicates |
| **Too many results** | 100+ duplicates | Increase `--similarity` to 0.6 | Misses subtle duplicates |
| **False positives** | Many irrelevant matches | Use `--severity critical` | Fewer results |
| **Memory issues** | Out of memory error | Analyze by directory | Multiple commands needed |

**CLI Options:**
- `--stream-results` - Output duplicates as found (enabled by default)
- `--no-approx` - Disable approximate mode (slower, O(B²) complexity, use with caution)
- `--min-lines N` - Filter blocks smaller than N lines (default 5)

### Controlling Analysis Scope

The tool analyzes **all extracted code blocks** by default. Control scope using:

**1. `--min-lines` (primary filter):**
- Filters blocks during extraction (most efficient)
- Higher values = focus on substantial functions
- Lower values = catch smaller utility duplicates

**2. `--no-approx` mode (use with caution):**
- Disables approximate mode (candidate pre-filtering)
- O(B²) complexity - compares every block to every other block
- **Automatic safety limit:** 500K comparisons (~1000 blocks max)
- Shows warning when used with >500 blocks
- Approximate mode (default) is recommended for all use cases

**Examples:**
```bash
# Focus on substantial functions only
aiready-patterns ./src --min-lines 15

# Comprehensive scan of all functions (recommended)
aiready-patterns ./src --min-lines 5

# Quick scan of major duplicates
aiready-patterns ./src --min-lines 20
```

**Recommendations by codebase size:**

| Repo Size | Files | Strategy | Expected Time |
|-----------|-------|----------|---------------|
| **Small** | <100 | Use defaults | <1s ✅ |
| **Medium** | 100-500 | Use defaults | 1-5s ✅ |
| **Large** | 500-1,000 | Use defaults or `--min-lines 10` | 3-10s ✅ |
| **Very Large** | 1,000-5,000 | `--min-lines 15` or analyze by module | 5-20s ⚠️ |
| **Super Large** | 5,000+ | **Analyze by module** (see below) | 10-60s per module ⚠️ |

### Analyzing Very Large Repositories

For repos with 1,000+ files, use modular analysis:

```bash
# Analyze by top-level directory
for dir in src/*/; do
  echo "Analyzing $dir"
  aiready-patterns "$dir" --min-lines 10
done

# Or focus on specific high-value areas
aiready-patterns ./src/api --min-lines 10
aiready-patterns ./src/core --min-lines 10
aiready-patterns ./src/services --min-lines 10

# For super large repos (5K+ files), increase thresholds
aiready-patterns ./src/backend --min-lines 20 --similarity 0.50
```

**Why modular analysis?**
- Ensures comprehensive coverage (100% of each module)
- Avoids hitting comparison budget limits
- Provides focused, actionable results per module
- Better for CI/CD integration (parallel jobs)

**Progress Indicators:**
- **Approx mode**: Shows blocks processed + duplicates found
- **Exact mode**: Shows % complete, ETA, and comparisons processed
- **Stream mode**: Prints each duplicate immediately when found (enabled by default)

## 🔧 CI/CD Integration

### GitHub Actions

```yaml
name: Pattern Detection

on: [pull_request]

jobs:
  detect-patterns:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npx @aiready/pattern-detect ./src --output json --output-file patterns.json
      - name: Check for critical issues
        run: |
          CRITICAL=$(jq '.summary.topDuplicates | map(select(.similarity > 0.95)) | length' patterns.json)
          if [ "$CRITICAL" -gt "0" ]; then
            echo "Found $CRITICAL critical duplicate patterns"
            exit 1
          fi
```

## 🤝 Contributing

We welcome contributions! This tool is part of the [AIReady](https://github.com/aiready/aiready) ecosystem.

## 📝 License

MIT - See LICENSE file

## 🔗 Related Tools (Coming Soon)

- **@aiready/context-analyzer** - Analyze token costs and context fragmentation
- **@aiready/doc-drift** - Track documentation freshness
- **@aiready/consistency** - Check naming pattern consistency

---

**Made with 💙 by the AIReady team** | [Docs](https://aiready.dev/docs) | [GitHub](https://github.com/aiready/aiready)
