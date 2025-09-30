import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateVoterPassword } from '@/lib/utils/password';
import { success, fail } from '@/lib/apiREsponse';
import type { Voter } from '@prisma/client';

const prisma = new PrismaClient();


interface UploadResults {
  success: Voter[];
  failed: Array<{ row: Record<string, unknown>; error: string }>;
  total: number;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return fail('Unauthorized', null, 401);
  }

  // Get admin's association
  const admin = await prisma.admin.findUnique({
    where: { id: session.user.id },
    select: { associationId: true },
  });

  if (!admin) {
    return fail('Admin not found', null, 404);
  }

  const { voters } = await req.json();

  const results: UploadResults = {
    success: [],
    failed: [],
    total: voters.length,
  };

  for (const voterData of voters) {
    try {
      // Convert and validate required fields
      const cleanedData = {
        first_name: String(voterData.first_name || '').trim(),
        last_name: String(voterData.last_name || '').trim(),
        email: String(voterData.email || '')
          .trim()
          .toLowerCase(),
        level: String(voterData.level || '').trim(),
        studentId: String(voterData.studentId || '').trim(),
      };

      // Validate required fields
      if (
        !cleanedData.first_name ||
        !cleanedData.last_name ||
        !cleanedData.email ||
        !cleanedData.level ||
        !cleanedData.studentId
      ) {
        results.failed.push({
          row: voterData,
          error: 'Missing required fields',
        });
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanedData.email)) {
        results.failed.push({
          row: voterData,
          error: 'Invalid email format',
        });
        continue;
      }

      // Check if voter already exists
      const existingVoter = await prisma.voter.findFirst({
        where: {
          OR: [{ email: cleanedData.email }, { studentId: cleanedData.studentId }],
          associationId: admin.associationId,
        },
      });

      if (existingVoter) {
        results.failed.push({
          row: voterData,
          error: 'Voter already exists with this email or student ID',
        });
        continue;
      }

      // Create voter
      const newVoter = await prisma.voter.create({
        data: {
          email: cleanedData.email,
          password: generateVoterPassword(),
          first_name: cleanedData.first_name,
          last_name: cleanedData.last_name,
          level: cleanedData.level,
          studentId: cleanedData.studentId,
          associationId: admin.associationId,
        },
      });

      results.success.push(newVoter);
    } catch (error) {
      console.error('Error creating voter:', error);
      results.failed.push({
        row: voterData,
        error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  return success('Bulk upload completed', results);
}
