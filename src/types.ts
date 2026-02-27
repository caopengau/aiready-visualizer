import type { Issue } from '@aiready/core';

export interface TestabilityOptions {
  /** Root directory to scan */
  rootDir: string;
  /** Minimum test-to-source ratio to consider acceptable (default: 0.3) */
  minCoverageRatio?: number;
  /** Custom test file patterns in addition to built-ins */
  testPatterns?: string[];
  /** Maximum scan depth */
  maxDepth?: number;
  /** File glob patterns to include */
  include?: string[];
  /** File glob patterns to exclude */
  exclude?: string[];
}

export interface TestabilityIssue extends Issue {
  type: 'low-testability';
  /** Category of testability barrier */
  dimension:
    | 'test-coverage'
    | 'purity'
    | 'dependency-injection'
    | 'interface-focus'
    | 'observability'
    | 'framework';
}

export interface TestabilityReport {
  summary: {
    sourceFiles: number;
    testFiles: number;
    coverageRatio: number;
    score: number;
    rating: 'excellent' | 'good' | 'moderate' | 'poor' | 'unverifiable';
    /** THE MOST IMPORTANT FIELD: is AI-generated code safe to ship? */
    aiChangeSafetyRating: 'safe' | 'moderate-risk' | 'high-risk' | 'blind-risk';
    dimensions: {
      testCoverageRatio: number;
      purityScore: number;
      dependencyInjectionScore: number;
      interfaceFocusScore: number;
      observabilityScore: number;
    };
  };
  issues: TestabilityIssue[];
  rawData: {
    sourceFiles: number;
    testFiles: number;
    pureFunctions: number;
    totalFunctions: number;
    injectionPatterns: number;
    totalClasses: number;
    bloatedInterfaces: number;
    totalInterfaces: number;
    externalStateMutations: number;
    hasTestFramework: boolean;
  };
  recommendations: string[];
}
