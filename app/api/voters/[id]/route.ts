import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateVoterPassword } from '@/lib/utils/password';
import { success, fail } from '@/lib/apiREsponse';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateVoterSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  level: z.string().min(1).optional(),
  studentId: z.string().min(1).optional(),
  regeneratePassword: z.boolean().optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return fail('Unauthorized', null, 401);
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.user.id },
    select: { associationId: true },
  });

  if (!admin) {
    return fail('Admin not found', null, 404);
  }

  const body = await req.json();
  const result = updateVoterSchema.safeParse(body);

  if (!result.success) {
    return fail('Invalid data', result.error.issues, 400);
  }

  const { regeneratePassword, ...updateData } = result.data;

  // Create update object with proper typing
  const voterUpdateData: any = { ...updateData };

  // Add new password if regenerating
  if (regeneratePassword) {
    voterUpdateData.password = generateVoterPassword();
  }

  const voter = await prisma.voter.update({
    where: {
      id: params.id,
      associationId: admin.associationId,
    },
    data: voterUpdateData,
  });

  return success('Voter updated successfully', voter);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return fail('Unauthorized', null, 401);
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.user.id },
    select: { associationId: true },
  });

  if (!admin) {
    return fail('Admin not found', null, 404);
  }

  // Try to parse bulk delete body
  let body: any = null;
  try {
    body = await req.json();
  } catch {}

  if (body && Array.isArray(body.ids)) {
    // Bulk delete
    const result = await prisma.voter.deleteMany({
      where: {
        id: { in: body.ids },
        associationId: admin.associationId,
      },
    });
    return success(`${result.count} voters deleted successfully`, null);
  } else {
    // Single delete
    await prisma.voter.delete({
      where: {
        id: params.id,
        associationId: admin.associationId,
      },
    });
    return success('Voter deleted successfully', null);
  }
}
