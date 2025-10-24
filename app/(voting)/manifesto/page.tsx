import { prisma } from '@/lib/prisma';
import { ManifestoQAInterface } from '@/components/manifesto/ManifestoQAInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, MessageSquare } from 'lucide-react';

async function getElectionData() {
  try {
    // Get the active election
    const election = await prisma.election.findFirst({
      where: { isActive: true },
      include: {
        candidates: {
          include: {
            position: true,
          },
          orderBy: [
            { position: { order: 'asc' } },
            { name: 'asc' }
          ]
        },
        association: {
          select: {
            name: true,
            logoUrl: true,
          }
        }
      }
    });

    if (!election) {
      return null;
    }

    // Filter candidates that have manifestos
    const candidatesWithManifestos = election.candidates.filter(
      candidate => candidate.manifestoSummary || candidate.manifesto
    );

    return {
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        association: election.association,
      },
      candidates: candidatesWithManifestos.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        position: candidate.position.name,
        positionId: candidate.position.id,
        manifestoSummary: candidate.manifestoSummary,
        manifestoUrl: candidate.manifesto,
        photoUrl: candidate.photoUrl,
      }))
    };
  } catch (error) {
    console.error('Error fetching election data:', error);
    return null;
  }
}

export default async function ManifestoPage() {
  const data = await getElectionData();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold mb-2">No Active Election</h1>
            <p className="text-muted-foreground mb-4">
              There are no active elections with candidate manifestos available at this time.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Voting
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { election, candidates } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {election.association.logoUrl && (
              <img
                src={election.association.logoUrl}
                alt={election.association.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{election.association.name}</h1>
              <p className="text-muted-foreground">Candidate Manifestos & Q&A</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Manifestos Available</p>
                <p className="text-lg font-bold">{candidates.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Positions</p>
                <p className="text-lg font-bold">
                  {new Set(candidates.map(c => c.positionId)).size}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ask Questions</p>
                <p className="text-lg font-bold">AI Powered</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Q&A Interface */}
        <ManifestoQAInterface 
          electionId={election.id}
          candidates={candidates}
        />
      </div>
    </div>
  );
}