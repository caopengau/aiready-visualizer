import type { AIReadyConfig } from '@aiready/core';
import { AnalysisStatus, Severity } from '@aiready/core/client';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  githubId?: string;
  googleId?: string;
  passwordHash?: string;
  emailVerified?: string;
  teamId?: string;
  role?: 'owner' | 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
  scanConfig?: AIReadyConfig;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  githubInstallationId?: string;
  githubOrgName?: string;
  memberCount: number;
  repoLimit: number;
  createdAt: string;
  updatedAt: string;
  scanConfig?: AIReadyConfig;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Repository {
  id: string;
  teamId?: string;
  userId: string;
  name: string;
  url: string;
  description?: string;
  defaultBranch: string;
  lastAnalysisAt?: string;
  aiScore?: number;
  potentialSavings?: number;
  isScanning?: boolean;
  lastError?: string;
  lastCommitHash?: string;
  createdAt: string;
  updatedAt: string;
  scanConfig?: AIReadyConfig;
}

export interface Analysis {
  id: string;
  repoId: string;
  userId: string;
  timestamp: string;
  aiScore: number;
  status: AnalysisStatus | 'processing' | 'completed' | 'failed';
  breakdown: {
    semanticDuplicates?: number;
    contextFragmentation?: number;
    namingConsistency?: number;
    documentationHealth?: number;
    dependencyHealth?: number;
    aiSignalClarity?: number;
    agentGrounding?: number;
    testabilityIndex?: number;
    changeAmplification?: number;
    cognitiveLoad?: number;
    patternEntropy?: number;
    conceptCohesion?: number;
    docDrift?: number;
    semanticDistance?: number;
  };
  rawKey: string;
  summary: {
    totalFiles: number;
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
    executionTime?: number;
    config?: AIReadyConfig;
    businessImpact?: {
      estimatedMonthlyWaste: number;
      potentialSavings: number;
      productivityHours: number;
    };
  };
  executionTime?: number;
  details?: any[];
  error?: string;
  createdAt: string;
}

export interface RemediationRequest {
  id: string;
  repoId: string;
  teamId?: string;
  userId: string;
  type: 'consolidation' | 'rename' | 'restructure' | 'refactor';
  risk: Severity | 'low' | 'medium' | 'high' | 'critical';
  status:
    | 'pending'
    | 'in-progress'
    | 'reviewing'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'pr-created'
    | 'failed';
  agentStatus?: string;
  prUrl?: string;
  prNumber?: number;
  title: string;
  description: string;
  affectedFiles: string[];
  estimatedSavings: number;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MagicLinkToken {
  token: string;
  email: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
}
