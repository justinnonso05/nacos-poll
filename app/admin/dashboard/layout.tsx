import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import Sidebar from '@/components/admin/Sidebar';
import TopNav from '@/components/admin/TopNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  const prisma = new PrismaClient();
  const rawAssociation = await prisma.association.findUnique({
    where: { id: session.user.associationId },
    select: { id: true, name: true, logoUrl: true },
  });

  if (!rawAssociation) {
    redirect('/admin/login');
  }

  // Fix logoUrl type for Sidebar
  const association = {
    ...rawAssociation,
    logoUrl: rawAssociation.logoUrl ?? undefined,
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Hidden on mobile, show on desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar association={association} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Mobile sidebar overlay - you can implement this later if needed */}
    </div>
  );
}
