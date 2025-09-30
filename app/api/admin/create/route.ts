import { PrismaClient } from '@prisma/client';
import { adminSchema } from '@/lib/schemas/admin';
import { success, fail } from '@/lib/apiREsponse';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'SUPERADMIN') {
      return fail('Unauthorized', null, 401);
    }

    const body = await req.json();

    // Remove associationId from validation and use superadmin's association
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return fail('Email, password, and role are required', null, 400);
    }

    // Check if admin already exists
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return fail('Admin already exists.', null, 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Use the superadmin's association ID
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        role,
        associationId: session.user.associationId, // Auto-pass superadmin's association ID
      },
    });

    return success(
      'Admin created successfully.',
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        associationId: admin.associationId,
      },
      201
    );
  } catch (error) {
    return fail('Failed to create admin.', null, 500);
  }
}
