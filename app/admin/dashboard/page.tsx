import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Vote, TrendingUp, Trophy, Calendar } from 'lucide-react';
import TurnoutChart from '@/components/admin/TurnoutChart';
import PositionResultsSlider from '@/components/admin/PositionResultsSlider';
import TurnoutByLevelChart from '@/components/admin/TurnoutByLevelChart';

async function getDashboardData(associationId: string) {
  // Get active election
  const activeElection = await prisma.election.findFirst({
    where: {
      associationId,
      // isActive: true,
      // startAt: { lte: new Date() },
      // endAt: { gte: new Date() }
    },
    include: {
      association: {
        select: { name: true, description: true },
      },
    },
  });

  if (!activeElection) {
    return {
      election: null,
      stats: null,
      positionResults: [],
      turnoutByLevel: [],
    };
  }

  // Get basic stats
  const totalVoters = await prisma.voter.count({
    where: { associationId },
  });

  const totalVotes = await prisma.voter.count({
    where: { associationId, hasVoted: true },
  });

  const totalCandidates = await prisma.candidate.count({
    where: { electionId: activeElection.id },
  });

  // Get positions with candidates and their votes
  const positions = await prisma.position.findMany({
    where: { associationId },
    include: {
      candidates: {
        where: { electionId: activeElection.id },
        include: {
          votes: {
            select: { id: true },
          },
        },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  // Process position results with vote counts and tie detection
  const positionResults = positions
    .filter((position) => position.candidates.length > 0)
    .map((position) => {
      const candidatesWithVotes = position.candidates
        .map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          manifesto: candidate.manifesto,
          photoUrl: candidate.photoUrl,
          votes: candidate.votes.length,
          percentage: totalVotes > 0 ? (candidate.votes.length / totalVotes) * 100 : 0,
        }))
        .sort((a, b) => b.votes - a.votes); // Sort by votes descending

      // Detect ties and assign positions
      const candidatesWithRanks = candidatesWithVotes.map((candidate, index) => {
        let rank = index + 1;
        let isTied = false;

        // Check if tied with previous candidates
        if (index > 0 && candidate.votes === candidatesWithVotes[index - 1].votes) {
          // Find the rank of the first candidate with this vote count
          for (let i = index - 1; i >= 0; i--) {
            if (candidatesWithVotes[i].votes === candidate.votes) {
              rank = i + 1;
            } else {
              break;
            }
          }
          isTied = true;
        }

        // Check if tied with next candidates
        if (
          index < candidatesWithVotes.length - 1 &&
          candidate.votes === candidatesWithVotes[index + 1].votes
        ) {
          isTied = true;
        }

        return {
          ...candidate,
          rank,
          isTied,
        };
      });

      return {
        id: position.id,
        name: position.name,
        description: position.description,
        totalVotes: candidatesWithVotes.reduce((sum, c) => sum + c.votes, 0),
        candidates: candidatesWithRanks,
      };
    });

  // Get turnout by level using the actual level field
  const allVoters = await prisma.voter.findMany({
    where: { associationId },
    select: {
      level: true,
      hasVoted: true,
    },
  });

  // Group voters by their actual level field
  const levelGroups: Record<string, { total: number; voted: number }> = {};

  allVoters.forEach((voter) => {
    const level = voter.level || 'Unknown';

    if (!levelGroups[level]) {
      levelGroups[level] = { total: 0, voted: 0 };
    }

    levelGroups[level].total++;
    if (voter.hasVoted) {
      levelGroups[level].voted++;
    }
  });

  // Convert to array and calculate percentages, sort by level number
  const turnoutByLevelData = Object.entries(levelGroups)
    .map(([level, data]) => ({
      level,
      total: data.total,
      voted: data.voted,
      percentage: data.total > 0 ? (data.voted / data.total) * 100 : 0,
    }))
    .sort((a, b) => {
      // Sort by level number (100, 200, 300, 400, etc.)
      const aNum = parseInt(a.level) || 999999;
      const bNum = parseInt(b.level) || 999999;
      return aNum - bNum;
    });

  const voterTurnout = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;

  return {
    election: {
      ...activeElection,
      startAt: activeElection.startAt.toISOString(),
      endAt: activeElection.endAt.toISOString(),
    },
    stats: {
      totalVoters,
      totalVotes,
      totalCandidates,
      voterTurnout: Math.round(voterTurnout * 100) / 100,
      totalPositions: positionResults.length,
    },
    positionResults,
    turnoutByLevel: turnoutByLevelData,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/admin/login');

  const associationId = session.user.associationId as string;
  const { election, stats, positionResults, turnoutByLevel } =
    await getDashboardData(associationId);

  if (!election || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Active Election</h2>
            <p className="text-muted-foreground mb-4">
              There are no active elections at this time.
            </p>
            <Badge variant="secondary">No Election Running</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getElectionStatus = () => {
    const now = new Date();
    const start = new Date(election.startAt);
    const end = new Date(election.endAt);

    if (now < start) return { status: 'Upcoming', variant: 'secondary' as const, isActive: false };
    if (now > end) return { status: 'Ended', variant: 'destructive' as const, isActive: false };
    return { status: 'Active', variant: 'default' as const, isActive: true };
  };

  const electionStatus = getElectionStatus();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{election.title}</h1>
              <p className="text-muted-foreground mb-3">{election.association.name}</p>
              <p className="text-sm text-muted-foreground mb-3">
                {formatDate(election.startAt)} - {formatDate(election.endAt)}
              </p>
              <Badge variant={electionStatus.variant}>{electionStatus.status}</Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{stats.voterTurnout}%</div>
              <p className="text-sm text-muted-foreground">Voter Turnout</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Registered Voters
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalVoters.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total eligible voters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Votes Cast
              </CardTitle>
              <Vote className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalVotes.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalVotes > 0 ? '+' : ''}
                {stats.totalVotes} votes recorded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Candidates
              </CardTitle>
              <UserCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalCandidates}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {stats.totalPositions} positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Turnout Rate
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.voterTurnout}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalVoters - stats.totalVotes} voters remaining
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Position Results Slider */}
        <div className="mb-8">
          <PositionResultsSlider
            positions={positionResults}
            isElectionActive={electionStatus.isActive}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Overall Turnout Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Overall Voter Turnout</CardTitle>
              <p className="text-sm text-muted-foreground">
                {stats.totalVotes.toLocaleString()} of {stats.totalVoters.toLocaleString()} voters
                have participated
              </p>
            </CardHeader>
            <CardContent>
              <TurnoutChart
                voted={stats.totalVotes}
                notVoted={stats.totalVoters - stats.totalVotes}
                votedPercentage={stats.voterTurnout}
              />
            </CardContent>
          </Card>

          {/* Turnout by Level */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Turnout by Student Level</CardTitle>
              <p className="text-sm text-muted-foreground">
                Participation breakdown by academic level
              </p>
            </CardHeader>
            <CardContent>
              <TurnoutByLevelChart data={turnoutByLevel} />
            </CardContent>
          </Card>
        </div>

        {/* Live Updates Notice */}
        {/* <div className="mt-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <p className="text-sm text-foreground">
                  Live updates - Data refreshes automatically as votes are cast
                </p>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}
