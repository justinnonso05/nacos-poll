import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Vote, TrendingUp } from "lucide-react"
import dummyData from "@/lib/dummy-data.json"
import TurnoutChart from "@/components/admin/TurnoutChart"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) redirect("/admin/login")

  const { stats, elections, association } = dummyData

  // Calculate turnout data
  const voted = stats.totalVotes
  const notVoted = stats.totalVoters - stats.totalVotes
  const votedPercentage = stats.voterTurnout

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{association.name} Election 2024</h1>
        <p className="text-muted-foreground">{association.description} • March 15, 2024 - March 20, 2024</p>
        <Badge className="mt-2" variant="default">Active</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVoters.toLocaleString()}</div>
            <p className="text-xs text-green-600">+12.5% vs last period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-green-600">+3% vs last period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Vote Count</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVotes}</div>
            <p className="text-xs text-green-600">+18.2% vs last period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voter Turnout</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.voterTurnout}%</div>
            <p className="text-xs text-green-600">+5.2% vs last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Election Results and Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Presidential Election Results</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total: {stats.totalVotes} votes cast
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {elections[0].candidates.map((candidate, index) => (
              <div key={candidate.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="font-medium">{candidate.name}</p>
                    <p className="text-sm text-muted-foreground">({candidate.position})</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{candidate.votes}</p>
                  <p className="text-sm text-muted-foreground">{candidate.percentage}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voter Turnout</CardTitle>
            <p className="text-sm text-muted-foreground">
              {voted.toLocaleString()} out of {stats.totalVoters.toLocaleString()} voters
            </p>
          </CardHeader>
          <CardContent>
            <TurnoutChart 
              voted={voted}
              notVoted={notVoted}
              votedPercentage={votedPercentage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}