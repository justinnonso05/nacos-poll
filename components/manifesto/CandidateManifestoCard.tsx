'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, FileText, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

interface Candidate {
  id: string;
  name: string;
  position: string;
  manifestoSummary: string | null;
  manifestoUrl: string | null;
  photoUrl: string | null;
}

interface CandidateManifestoCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function CandidateManifestoCard({ 
  candidate, 
  isSelected, 
  onSelectionChange 
}: CandidateManifestoCardProps) {
  const [showFullSummary, setShowFullSummary] = useState(false);

  const handleViewManifesto = () => {
    if (candidate.manifestoUrl) {
      window.open(candidate.manifestoUrl, '_blank');
    }
  };

  const truncatedSummary = candidate.manifestoSummary?.slice(0, 200) + '...';
  const shouldTruncate = candidate.manifestoSummary && candidate.manifestoSummary.length > 200;

  return (
    <Card className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelectionChange}
              className="mt-1"
            />
            {candidate.photoUrl ? (
              <Image
                src={candidate.photoUrl}
                alt={candidate.name}
                width={40}
                height={40}
                className="w-10 h-10 object-cover rounded-full border"
              />
            ) : (
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-sm">
                  {getInitials(candidate.name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight">{candidate.name}</CardTitle>
            <Badge variant="secondary" className="text-xs mt-1">
              {candidate.position}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {candidate.manifestoSummary ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Manifesto Summary:</h4>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {shouldTruncate && !showFullSummary 
                ? truncatedSummary 
                : candidate.manifestoSummary
              }
            </div>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullSummary(!showFullSummary)}
                className="text-xs p-0 h-auto text-primary hover:text-primary/80"
              >
                {showFullSummary ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Read more
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            No manifesto summary available
          </div>
        )}

        {candidate.manifestoUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewManifesto}
            className="w-full"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Full Manifesto
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}