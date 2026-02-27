/**
 * Testability analyzer.
 *
 * Walks the codebase and measures 5 structural dimensions that determine
 * whether AI-generated changes can be safely verified:
 * 1. Test file coverage ratio
 * 2. Pure function prevalence
 * 3. Dependency injection patterns
 * 4. Interface focus (bloated interface detection)
 * 5. Observability (return values vs. external state mutations)
 */

import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { parse } from '@typescript-eslint/typescript-estree';
import type { TSESTree } from '@typescript-eslint/types';
import { calculateTestabilityIndex } from '@aiready/core';
import type {
  TestabilityOptions,
  TestabilityIssue,
  TestabilityReport,
} from './types';

// ---------------------------------------------------------------------------
// File classification
// ---------------------------------------------------------------------------

const SRC_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const DEFAULT_EXCLUDES = [
  'node_modules',
  'dist',
  '.git',
  'coverage',
  '.turbo',
  'build',
];
const TEST_PATTERNS = [
  /\.(test|spec)\.(ts|tsx|js|jsx)$/,
  /__tests__\//,
  /\/tests?\//,
  /\/e2e\//,
  /\/fixtures\//,
];

function isTestFile(filePath: string, extra?: string[]): boolean {
  if (TEST_PATTERNS.some((p) => p.test(filePath))) return true;
  if (extra) return extra.some((p) => filePath.includes(p));
  return false;
}

function isSourceFile(filePath: string): boolean {
  return SRC_EXTENSIONS.has(extname(filePath));
}

function collectFiles(
  dir: string,
  options: TestabilityOptions,
  depth = 0
): string[] {
  if (depth > (options.maxDepth ?? 20)) return [];
  const excludes = [...DEFAULT_EXCLUDES, ...(options.exclude ?? [])];
  const files: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (excludes.some((ex) => entry === ex || entry.includes(ex))) continue;
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      files.push(...collectFiles(full, options, depth + 1));
    } else if (stat.isFile() && isSourceFile(full)) {
      if (!options.include || options.include.some((p) => full.includes(p))) {
        files.push(full);
      }
    }
  }
  return files;
}

// ---------------------------------------------------------------------------
// Per-file analysis
// ---------------------------------------------------------------------------

interface FileAnalysis {
  pureFunctions: number;
  totalFunctions: number;
  injectionPatterns: number;
  totalClasses: number;
  bloatedInterfaces: number;
  totalInterfaces: number;
  externalStateMutations: number;
}

function countMethodsInInterface(
  node: TSESTree.TSInterfaceDeclaration | TSESTree.TSTypeAliasDeclaration
): number {
  // Count method signatures
  if (node.type === 'TSInterfaceDeclaration') {
    return node.body.body.filter(
      (m) => m.type === 'TSMethodSignature' || m.type === 'TSPropertySignature'
    ).length;
  }
  if (
    node.type === 'TSTypeAliasDeclaration' &&
    node.typeAnnotation.type === 'TSTypeLiteral'
  ) {
    return node.typeAnnotation.members.length;
  }
  return 0;
}

function hasDependencyInjection(
  node: TSESTree.ClassDeclaration | TSESTree.ClassExpression
): boolean {
  // Look for a constructor with typed parameters (the most common DI pattern)
  for (const member of node.body.body) {
    if (
      member.type === 'MethodDefinition' &&
      member.key.type === 'Identifier' &&
      member.key.name === 'constructor'
    ) {
      const fn = member.value;
      if (fn.params && fn.params.length > 0) {
        // If constructor takes parameters that are typed class/interface references, that's DI
        const typedParams = fn.params.filter((p) => {
          const param = p as any;
          return (
            param.typeAnnotation != null ||
            param.parameter?.typeAnnotation != null
          );
        });
        if (typedParams.length > 0) return true;
      }
    }
  }
  return false;
}

function isPureFunction(
  fn:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression
): boolean {
  let hasReturn = false;
  let hasSideEffect = false;

  function walk(node: TSESTree.Node) {
    if (node.type === 'ReturnStatement' && node.argument) hasReturn = true;
    if (
      node.type === 'AssignmentExpression' &&
      node.left.type === 'MemberExpression'
    )
      hasSideEffect = true;
    // Calls to console, process, global objects
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      ['console', 'process', 'window', 'document', 'fs'].includes(
        node.callee.object.name
      )
    )
      hasSideEffect = true;

    // Recurse
    for (const key of Object.keys(node)) {
      if (key === 'parent') continue;
      const child = (node as any)[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          child.forEach((c) => c?.type && walk(c));
        } else if (child.type) {
          walk(child);
        }
      }
    }
  }

  if (fn.body?.type === 'BlockStatement') {
    fn.body.body.forEach((s) => walk(s));
  } else if (fn.body) {
    hasReturn = true; // arrow expression body
  }

  return hasReturn && !hasSideEffect;
}

function hasExternalStateMutation(
  fn:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression
): boolean {
  let found = false;
  function walk(node: TSESTree.Node) {
    if (found) return;
    if (
      node.type === 'AssignmentExpression' &&
      node.left.type === 'MemberExpression'
    )
      found = true;
    for (const key of Object.keys(node)) {
      if (key === 'parent') continue;
      const child = (node as any)[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) child.forEach((c) => c?.type && walk(c));
        else if (child.type) walk(child);
      }
    }
  }
  if (fn.body?.type === 'BlockStatement') fn.body.body.forEach((s) => walk(s));
  return found;
}

function analyzeFileTestability(filePath: string): FileAnalysis {
  const result: FileAnalysis = {
    pureFunctions: 0,
    totalFunctions: 0,
    injectionPatterns: 0,
    totalClasses: 0,
    bloatedInterfaces: 0,
    totalInterfaces: 0,
    externalStateMutations: 0,
  };

  let code: string;
  try {
    code = readFileSync(filePath, 'utf-8');
  } catch {
    return result;
  }

  let ast: TSESTree.Program;
  try {
    ast = parse(code, {
      jsx: filePath.endsWith('.tsx') || filePath.endsWith('.jsx'),
      range: false,
      loc: false,
    });
  } catch {
    return result;
  }

  function visit(node: TSESTree.Node) {
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      result.totalFunctions++;
      if (isPureFunction(node)) result.pureFunctions++;
      if (hasExternalStateMutation(node)) result.externalStateMutations++;
    }

    if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      result.totalClasses++;
      if (hasDependencyInjection(node)) result.injectionPatterns++;
    }

    if (
      node.type === 'TSInterfaceDeclaration' ||
      node.type === 'TSTypeAliasDeclaration'
    ) {
      result.totalInterfaces++;
      const methodCount = countMethodsInInterface(node as any);
      if (methodCount > 10) result.bloatedInterfaces++;
    }

    // Recurse
    for (const key of Object.keys(node)) {
      if (key === 'parent') continue;
      const child = (node as any)[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) child.forEach((c) => c?.type && visit(c));
        else if (child.type) visit(child);
      }
    }
  }

  ast.body.forEach(visit);
  return result;
}

// ---------------------------------------------------------------------------
// Test framework detection
// ---------------------------------------------------------------------------

function detectTestFramework(rootDir: string): boolean {
  const pkgPath = join(rootDir, 'package.json');
  if (!existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    };
    const testFrameworks = [
      'jest',
      'vitest',
      'mocha',
      'jasmine',
      'ava',
      'tap',
      'pytest',
      'unittest',
    ];
    return testFrameworks.some((fw) => allDeps[fw]);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main analyzer
// ---------------------------------------------------------------------------

export async function analyzeTestability(
  options: TestabilityOptions
): Promise<TestabilityReport> {
  const allFiles = collectFiles(options.rootDir, options);

  const sourceFiles = allFiles.filter(
    (f) => !isTestFile(f, options.testPatterns)
  );
  const testFiles = allFiles.filter((f) => isTestFile(f, options.testPatterns));

  const aggregated: FileAnalysis = {
    pureFunctions: 0,
    totalFunctions: 0,
    injectionPatterns: 0,
    totalClasses: 0,
    bloatedInterfaces: 0,
    totalInterfaces: 0,
    externalStateMutations: 0,
  };

  for (const f of sourceFiles) {
    const a = analyzeFileTestability(f);
    for (const key of Object.keys(aggregated) as Array<keyof FileAnalysis>) {
      aggregated[key] += a[key];
    }
  }

  const hasTestFramework = detectTestFramework(options.rootDir);

  const indexResult = calculateTestabilityIndex({
    testFiles: testFiles.length,
    sourceFiles: sourceFiles.length,
    pureFunctions: aggregated.pureFunctions,
    totalFunctions: Math.max(1, aggregated.totalFunctions),
    injectionPatterns: aggregated.injectionPatterns,
    totalClasses: Math.max(1, aggregated.totalClasses),
    bloatedInterfaces: aggregated.bloatedInterfaces,
    totalInterfaces: Math.max(1, aggregated.totalInterfaces),
    externalStateMutations: aggregated.externalStateMutations,
    hasTestFramework,
  });

  // Build issues
  const issues: TestabilityIssue[] = [];
  const minCoverage = options.minCoverageRatio ?? 0.3;
  const actualRatio =
    sourceFiles.length > 0 ? testFiles.length / sourceFiles.length : 0;

  if (!hasTestFramework) {
    issues.push({
      type: 'low-testability',
      dimension: 'framework',
      severity: 'critical',
      message:
        'No testing framework detected in package.json — AI changes cannot be verified at all.',
      location: { file: options.rootDir, line: 0 },
      suggestion:
        'Add Jest, Vitest, or another testing framework as a devDependency.',
    });
  }

  if (actualRatio < minCoverage) {
    const needed =
      Math.ceil(sourceFiles.length * minCoverage) - testFiles.length;
    issues.push({
      type: 'low-testability',
      dimension: 'test-coverage',
      severity: actualRatio === 0 ? 'critical' : 'major',
      message: `Test ratio is ${Math.round(actualRatio * 100)}% (${testFiles.length} test files for ${sourceFiles.length} source files). Need at least ${Math.round(minCoverage * 100)}%.`,
      location: { file: options.rootDir, line: 0 },
      suggestion: `Add ~${needed} test file(s) to reach the ${Math.round(minCoverage * 100)}% minimum for safe AI assistance.`,
    });
  }

  if (indexResult.dimensions.purityScore < 50) {
    issues.push({
      type: 'low-testability',
      dimension: 'purity',
      severity: 'major',
      message: `Only ${indexResult.dimensions.purityScore}% of functions are pure — side-effectful functions require complex test setup.`,
      location: { file: options.rootDir, line: 0 },
      suggestion:
        'Extract pure transformation logic from I/O and mutation code.',
    });
  }

  if (indexResult.dimensions.observabilityScore < 50) {
    issues.push({
      type: 'low-testability',
      dimension: 'observability',
      severity: 'major',
      message: `Many functions mutate external state directly — outputs are invisible to unit tests.`,
      location: { file: options.rootDir, line: 0 },
      suggestion: 'Prefer returning values over mutating shared state.',
    });
  }

  return {
    summary: {
      sourceFiles: sourceFiles.length,
      testFiles: testFiles.length,
      coverageRatio: Math.round(actualRatio * 100) / 100,
      score: indexResult.score,
      rating: indexResult.rating,
      aiChangeSafetyRating: indexResult.aiChangeSafetyRating,
      dimensions: indexResult.dimensions,
    },
    issues,
    rawData: {
      sourceFiles: sourceFiles.length,
      testFiles: testFiles.length,
      ...aggregated,
      hasTestFramework,
    },
    recommendations: indexResult.recommendations,
  };
}
