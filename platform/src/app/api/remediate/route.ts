import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getRemediation, updateRemediation } from '@/lib/db/remediation';
import { RefactorAgent } from '@aiready/agents';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { remediationId } = await req.json();
    if (!remediationId) {
      return NextResponse.json(
        { error: 'Missing remediationId' },
        { status: 400 }
      );
    }

    const remediation = await getRemediation(remediationId);
    if (!remediation) {
      return NextResponse.json(
        { error: 'Remediation not found' },
        { status: 404 }
      );
    }

    // 1. Update status to 'in-progress'
    await updateRemediation(remediationId, {
      status: 'in-progress',
      agentStatus: 'Analyzing duplicates...',
    });

    // 2. Trigger Mastra Refactor Agent (Simulated for Alpha)
    console.log(`[RemediateAPI] Triggering RefactorAgent for ${remediationId}`);

    // In a real implementation, this would be an async background task (SQS)
    // For Alpha, we simulate the agentic loop
    setTimeout(async () => {
      try {
        await updateRemediation(remediationId, {
          agentStatus: 'Generating consolidated code...',
        });

        // Mocking RefactorAgent execution
        const mockResult = {
          status: 'success',
          prUrl: 'https://github.com/caopengau/aiready/pull/123',
          prNumber: 123,
        };

        await updateRemediation(remediationId, {
          status: 'pr-created',
          agentStatus: 'PR Created',
          prUrl: mockResult.prUrl,
          prNumber: mockResult.prNumber,
        });
      } catch (err) {
        console.error('[RemediateAPI] Mastra execution failed:', err);
        await updateRemediation(remediationId, {
          status: 'failed',
          agentStatus: 'Refactoring failed',
        });
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      message: 'Remediation agent started',
    });
  } catch (error) {
    console.error('[RemediateAPI] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
