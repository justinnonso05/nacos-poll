import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default async function TopNav() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) return null

  const initials = session.user.email
    ?.split('@')[0]
    .split('.')
    .map(name => name[0])
    .join('')
    .toUpperCase() || 'AD'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4 flex-1">
        <h1 className="text-xl font-semibold">Election Dashboard</h1>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <Badge variant={session.user.role === 'SUPERADMIN' ? 'default' : 'secondary'} className="text-xs">
              {session.user.role}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hover:opacity-80">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.role}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {session.user.role === 'SUPERADMIN' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/manage-admins">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Admins
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}