import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { z } from "zod"
import { success, fail } from "@/lib/apiREsponse"

const prisma = new PrismaClient()

const deleteSchema = z.object({
  id: z.uuid(),
})

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "SUPERADMIN") {
    return fail("Forbidden: Only superadmins can delete elections.", null, 403)
  }

  try {
    const body = await req.json()
    const result = deleteSchema.safeParse(body)
    if (!result.success) {
      return fail("Invalid data", result.error.issues, 400)
    }

    const { id } = result.data

    await prisma.election.delete({
      where: { id },
    })

    return success("Election deleted successfully.", null, 200)
  } catch (error) {
    return fail("Failed to delete election.", null, 500)
  }
}