import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

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
        {/* <div className="relative hidden md:block">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 pl-8"
          />
        </div> */}

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium">{session.user.email}</div>
            <Badge variant={session.user.role === 'SUPERADMIN' ? 'default' : 'secondary'} className="text-xs">
              {session.user.role}
            </Badge>
          </div>
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}