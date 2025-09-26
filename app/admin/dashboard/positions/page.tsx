import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import PositionsTable from "@/components/admin/positions/PositionsTable"

const prisma = new PrismaClient()

export default async function PositionsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/admin/login')
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.user.id },
    select: { associationId: true }
  })

  if (!admin) {
    redirect('/admin/login')
  }

  const positions = await prisma.position.findMany({
    where: { associationId: admin.associationId },
    include: {
      _count: {
        select: { candidates: true }
      }
    },
    orderBy: { order: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Electoral Positions</h1>
        <p className="text-muted-foreground">
          Manage the electoral positions available in your elections
        </p>
      </div>

      <PositionsTable positions={positions} />
    </div>
  )
}