import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { success, fail } from "@/lib/apiREsponse"
import { z } from "zod"

const prisma = new PrismaClient()

const updatePositionSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
  maxCandidates: z.number().int().min(1).optional()
})

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return fail("Unauthorized", null, 401)
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: { associationId: true }
    })

    if (!admin) {
      return fail("Admin not found", null, 404)
    }

    const body = await req.json()
    const result = updatePositionSchema.safeParse(body)
    
    if (!result.success) {
      return fail("Invalid data", result.error.issues, 400)
    }

    // Check if position exists and belongs to admin's association
    const existingPosition = await prisma.position.findFirst({
      where: {
        id: params.id,
        associationId: admin.associationId
      }
    })

    if (!existingPosition) {
      return fail("Position not found", null, 404)
    }

    // If updating name, check for duplicates
    if (result.data.name && result.data.name !== existingPosition.name) {
      const duplicatePosition = await prisma.position.findFirst({
        where: {
          name: result.data.name,
          associationId: admin.associationId,
          id: { not: params.id }
        }
      })

      if (duplicatePosition) {
        return fail("Position with this name already exists", null, 409)
      }
    }

    const position = await prisma.position.update({
      where: { id: params.id },
      data: result.data,
      include: {
        _count: {
          select: { candidates: true }
        }
      }
    })

    return success("Position updated successfully", position)
  } catch (error) {
    console.error("Error updating position:", error)
    return fail("Internal server error", null, 500)
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return fail("Unauthorized", null, 401)
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: { associationId: true }
    })

    if (!admin) {
      return fail("Admin not found", null, 404)
    }

    // Check if position exists and belongs to admin's association
    const existingPosition = await prisma.position.findFirst({
      where: {
        id: params.id,
        associationId: admin.associationId
      }
    })

    if (!existingPosition) {
      return fail("Position not found", null, 404)
    }

    // Check if position has candidates
    const candidateCount = await prisma.candidate.count({
      where: { positionId: params.id }
    })

    if (candidateCount > 0) {
      return fail("Cannot delete position with existing candidates", null, 400)
    }

    await prisma.position.delete({
      where: { id: params.id }
    })

    return success("Position deleted successfully", null)
  } catch (error) {
    console.error("Error deleting position:", error)
    return fail("Internal server error", null, 500)
  }
}