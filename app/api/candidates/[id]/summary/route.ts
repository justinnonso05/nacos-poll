import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { success, fail } from '@/lib/apiREsponse';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return fail('Unauthorized', 401);
    }

    const candidateId = params.id;

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        name: true,
        manifesto: true,           // PDF URL
        manifestoSummary: true,    // AI-generated summary
        position: {
          select: { name: true }
        },
      },
    });

    if (!candidate) {
      return fail('Candidate not found', 404);
    }

    if (!candidate.manifestoSummary) {
      return fail('No manifesto summary available for this candidate', 404);
    }


    return success("Success", candidate);

  } catch (error) {
    console.error('Error fetching manifesto summary:', error);
    return fail('Failed to fetch manifesto summary', 500);
  }
}