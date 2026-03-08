import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getRepository, getLatestAnalysis } from '@/lib/db';
import { getAnalysis, normalizeReport } from '@/lib/storage';
import { seedInitialRemediations } from '@/lib/db/seed-remediations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId } = await params;

    const repo = await getRepository(repoId);
    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Auth check: User must own the repo.
    // TODO: Implement proper team membership check
    if (repo.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to repo' },
        { status: 403 }
      );
    }

    const latestAnalysisRecord = await getLatestAnalysis(repoId);
    if (!latestAnalysisRecord || !latestAnalysisRecord.rawKey) {
      return NextResponse.json(
        {
          error: 'No analysis found for this repository',
          repo,
        },
        { status: 404 }
      );
    }

    // Seed initial remediations for alpha demo
    await seedInitialRemediations(repoId, session.user.id);

    const fullAnalysis = await getAnalysis(latestAnalysisRecord.rawKey);
    if (!fullAnalysis) {
      return NextResponse.json(
        {
          error: 'Analysis details not found in storage',
          repo,
        },
        { status: 404 }
      );
    }

    // Normalize the report for the frontend (flattens issues, maps keys)
    // Force normalization to ensure we get the latest structure even if stored in an older format
    const normalizedAnalysis = normalizeReport(fullAnalysis, true);

    return NextResponse.json({
      repo,
      analysis: normalizedAnalysis,
      timestamp: latestAnalysisRecord.timestamp,
    });
  } catch (error) {
    console.error('Error fetching latest analysis:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
