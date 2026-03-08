import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listRemediations } from '@/lib/db/remediation';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const remediations = await listRemediations(params.id);
    return NextResponse.json({ remediations });
  } catch (error) {
    console.error('[RemediationsAPI] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
