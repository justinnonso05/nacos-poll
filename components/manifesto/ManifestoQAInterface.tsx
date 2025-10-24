'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CandidateManifestoCard } from '@/components/manifesto//CandidateManifestoCard';
import { ManifestoQAChat } from '@/components/manifesto//ManifestoQAChat';
import { FrequentlyAsked } from '@/components/manifesto/FrequentlyAsked';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, HelpCircle, BookOpen } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  position: string;
  positionId: string;
  manifestoSummary: string | null;
  manifestoUrl: string | null;
  photoUrl: string | null;
}

interface ManifestoQAInterfaceProps {
  electionId: string;
  candidates: Candidate[];
}

export function ManifestoQAInterface({ electionId, candidates }: ManifestoQAInterfaceProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const groupedCandidates = candidates.reduce((acc, candidate) => {
    const position = candidate.position;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(candidate);
    return acc;
  }, {} as Record<string, Candidate[]>);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manifestos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manifestos" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Manifestos
          </TabsTrigger>
          <TabsTrigger value="qa" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Ask Questions
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manifestos" className="space-y-6">
          {Object.entries(groupedCandidates).map(([position, positionCandidates]) => (
            <Card key={position}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {position}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({positionCandidates.length} candidate{positionCandidates.length !== 1 ? 's' : ''})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {positionCandidates.map((candidate) => (
                    <CandidateManifestoCard
                      key={candidate.id}
                      candidate={candidate}
                      isSelected={selectedCandidates.includes(candidate.id)}
                      onSelectionChange={(selected) => {
                        setSelectedCandidates(prev => 
                          selected 
                            ? [...prev, candidate.id]
                            : prev.filter(id => id !== candidate.id)
                        );
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="qa">
          <ManifestoQAChat 
            electionId={electionId}
            candidates={candidates}
            selectedCandidates={selectedCandidates}
            onCandidateSelect={setSelectedCandidates}
          />
        </TabsContent>

        <TabsContent value="faq">
          <FrequentlyAsked 
            electionId={electionId}
            candidates={candidates}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}