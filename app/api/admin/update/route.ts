import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from "bcryptjs"
import { updateSchema } from "@/lib/schemas/admin"

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const body = await req.json()
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return new Response(JSON.stringify({ error: "Invalid data", details: result.error.issues }), { status: 400 })
  }

  const { email, currentPassword, newPassword, confirmPassword } = result.data

  // Fetch admin
  const admin = await prisma.admin.findUnique({ where: { id: session.user.id } })
  if (!admin) {
    return new Response(JSON.stringify({ error: "Admin not found" }), { status: 404 })
  }

  // If changing password, require currentPassword and confirmation
  let passwordUpdate = {}
  if (newPassword) {
    if (!currentPassword) {
      return new Response(JSON.stringify({ error: "Current password is required to change password" }), { status: 400 })
    }
    const valid = await bcrypt.compare(currentPassword, admin.passwordHash)
    if (!valid) {
      return new Response(JSON.stringify({ error: "Current password is incorrect" }), { status: 403 })
    }
    if (newPassword !== confirmPassword) {
      return new Response(JSON.stringify({ error: "Passwords do not match" }), { status: 400 })
    }
    const hashed = await bcrypt.hash(newPassword, 10)
    passwordUpdate = { passwordHash: hashed }
  }

  // Update admin
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      email,
      ...passwordUpdate,
    },
  })

  return new Response(JSON.stringify({ success: true }), { status: 200 })
}