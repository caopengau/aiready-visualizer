import { NextRequest, NextResponse } from 'next/server';
import { getRepositoryMetrics } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repoId = params.id;
    const { searchParams } = new URL(req.url);
    const metricType = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');

    // Fetch metrics from DB
    const metrics = await getRepositoryMetrics({
      repoId,
      metricType,
      limit,
    });

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('[MetricsAPI] Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
