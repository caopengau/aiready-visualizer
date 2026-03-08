import { SQSEvent } from 'aws-lambda';
import * as fs from 'fs';
import * as path from 'path';
import * as git from 'isomorphic-git';
// @ts-ignore
import http from 'isomorphic-git/http/node';
import { randomUUID } from 'crypto';
import {
  normalizeReport,
  calculateAiScore,
  extractBreakdown,
  extractSummary,
  storeAnalysis,
} from '../lib/storage';
import {
  createAnalysis,
  getRepository,
  getUser,
  updateRepositoryScore,
  setRepositoryScanning,
} from '../lib/db';

export async function handler(event: SQSEvent) {
  for (const record of event.Records) {
    const { repoId, userId, accessToken } = JSON.parse(record.body) as {
      repoId: string;
      userId: string;
      accessToken?: string;
    };

    console.log(`[ScanWorker] Processing repo ${repoId} for user ${userId}`);

    const repo = await getRepository(repoId);
    if (!repo) {
      console.error(`[ScanWorker] Repository ${repoId} not found`);
      continue;
    }

    const tempDir = path.join('/tmp', `repo-${randomUUID()}`);

    try {
      // Clear any previous error
      await setRepositoryScanning(repoId, true);

      console.log(`[ScanWorker] Cloning ${repo.url} to ${tempDir}...`);

      await git.clone({
        fs,
        http,
        dir: tempDir,
        url: repo.url,
        singleBranch: true,
        depth: 1,
        onAuth: () => ({ username: accessToken || '', password: '' }),
      });

      // Get current commit hash
      const currentCommit = await git.resolveRef({
        fs,
        dir: tempDir,
        ref: 'HEAD',
      });

      console.log(
        `[ScanWorker] Current commit: ${currentCommit}. Last scanned: ${repo.lastCommitHash}`
      );

      if (repo.lastCommitHash === currentCommit) {
        console.log(
          `[ScanWorker] No changes detected for repo ${repoId}. Skipping scan.`
        );
        // Just clear the scanning flag
        await setRepositoryScanning(repoId, false);
        return;
      }

      console.log(`[ScanWorker] Running AIReady analysis...`);

      // Dynamic import of CLI and Core to avoid loading if not needed
      const [cli, core] = await Promise.all([
        import('@aiready/cli'),
        import('@aiready/core'),
      ]);
      const { ToolName } = core;
      const analyzeUnified =
        (cli as any).analyzeUnified || (cli as any).default?.analyzeUnified;
      const scoreUnified =
        (cli as any).scoreUnified || (cli as any).default?.scoreUnified;

      if (
        typeof analyzeUnified !== 'function' ||
        typeof scoreUnified !== 'function'
      ) {
        throw new Error(
          `[ScanWorker] Failed to load analyzeUnified or scoreUnified from @aiready/cli.`
        );
      }

      // Recommended Platform Defaults (matching ScanConfigForm.tsx)
      const recommendedDefaults = {
        scan: {
          tools: [
            ToolName.PatternDetect,
            ToolName.ContextAnalyzer,
            ToolName.NamingConsistency,
            ToolName.ChangeAmplification,
            ToolName.AiSignalClarity,
            ToolName.AgentGrounding,
            ToolName.TestabilityIndex,
            ToolName.DocDrift,
            ToolName.DependencyHealth,
          ],
          exclude: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
        },
        tools: {
          [ToolName.PatternDetect]: {
            minSimilarity: 0.8,
            minLines: 5,
            approx: true,
            minSharedTokens: 10,
            maxCandidatesPerBlock: 100,
          },
          [ToolName.ContextAnalyzer]: {
            maxDepth: 5,
            minCohesion: 0.6,
            maxFragmentation: 0.4,
            includeNodeModules: false,
            focus: 'all',
          },
          [ToolName.AiSignalClarity]: {
            checkMagicLiterals: true,
            checkBooleanTraps: true,
            checkAmbiguousNames: true,
            checkUndocumentedExports: true,
            checkImplicitSideEffects: true,
            checkDeepCallbacks: true,
          },
          [ToolName.AgentGrounding]: { maxRecommendedDepth: 4 },
          [ToolName.DocDrift]: { staleMonths: 6 },
          [ToolName.DependencyHealth]: { trainingCutoffYear: 2024 },
        },
        scoring: {
          threshold: 70,
        },
      };

      // Hierarchical Scan Configuration Strategy:
      // 1. Repository-specific override
      // 2. Team-level default (if repo belongs to a team)
      // 3. User-level default
      // 4. Platform-wide recommended defaults
      let scanConfig = repo.scanConfig;

      if (!scanConfig) {
        console.log(
          `[ScanWorker] No repo-specific config. Checking fallbacks...`
        );

        // Try Team fallback
        if (repo.teamId) {
          const { getTeam } = await import('../lib/db/teams');
          const team = await getTeam(repo.teamId);
          if (team?.scanConfig) {
            console.log(`[ScanWorker] Applying Team-level default config.`);
            scanConfig = team.scanConfig;
          }
        }

        // Try User fallback
        if (!scanConfig) {
          const user = await getUser(userId);
          if (user?.scanConfig) {
            console.log(`[ScanWorker] Applying User-level default config.`);
            scanConfig = user.scanConfig;
          }
        }
      }

      // Final fallback to Recommended Defaults
      if (!scanConfig) {
        console.log(`[ScanWorker] Using platform-wide recommended defaults.`);
        scanConfig = recommendedDefaults;
      }

      const analysisResults = await analyzeUnified({
        rootDir: tempDir,
        tools: scanConfig.scan?.tools,
        toolConfigs: scanConfig.tools,
        ...(scanConfig.scan || {}),
        progressCallback: (event: any) => {
          if (event.message) {
            console.log(`[ScanWorker] [${event.tool}] ${event.message}`);
          } else {
            console.log(`[ScanWorker] Tool ${event.tool} completed`);
          }
        },
      } as any);

      console.log(`[ScanWorker] Calculating scores...`);
      const scoring = await scoreUnified(analysisResults, {});

      const results = {
        ...analysisResults,
        scoring,
      };

      console.log(`[ScanWorker] Analysis complete. Normalizing results...`);

      const data = normalizeReport(results, false, tempDir);
      const timestamp = new Date().toISOString();
      const analysisId = randomUUID();

      // Calculate scores
      const aiScore = data.summary.aiReadinessScore;

      // Store in S3
      const rawKey = await storeAnalysis({
        userId,
        repoId,
        timestamp,
        data,
      });

      // Create record in DynamoDB
      await createAnalysis({
        id: analysisId,
        repoId,
        userId,
        timestamp,
        aiScore,
        breakdown: extractBreakdown(data),
        rawKey,
        summary: extractSummary(data),
        status: 'completed',
        createdAt: new Date().toISOString(),
      });

      // Save time-series metrics for historical trending
      await (async () => {
        const { saveMetricPoints } = await import('../lib/db/analysis');
        await saveMetricPoints({
          repoId,
          timestamp,
          metrics: {
            aiReadinessScore: aiScore,
            ...extractBreakdown(data),
          },
          runId: analysisId,
        });
      })();

      // Update repository score and clear scanning status
      await updateRepositoryScore(repoId, aiScore, currentCommit);

      console.log(
        `[ScanWorker] Successfully completed analysis ${analysisId} for repo ${repoId}`
      );
    } catch (error) {
      console.error(`[ScanWorker] Error processing repo ${repoId}:`, error);
      // Update repository status with error
      await setRepositoryScanning(
        repoId,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      // Cleanup temp directory
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      } catch (cleanupError) {
        console.error(`[ScanWorker] Cleanup error:`, cleanupError);
      }
    }
  }
}
