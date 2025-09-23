import { PrismaClient } from "@prisma/client"
import { adminSchema } from "@/lib/schemas/admin"
import { success, fail } from "@/lib/apiREsponse"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = adminSchema.safeParse(body)

    if (!result.success) {
      return fail("Invalid data", result.error.issues, 400)
    }

    const { email, password, role, associationId } = result.data

    // Check if admin already exists
    const existing = await prisma.admin.findUnique({ where: { email } })
    if (existing) {
      return fail("Admin already exists.", null, 409)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        role,
        associationId,
      },
    })

    return success("Admin created successfully.", {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      associationId: admin.associationId,
    }, 201)
  } catch (error) {
    return fail("Failed to create admin.", null, 500)
  }
}