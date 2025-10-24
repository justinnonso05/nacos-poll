'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Users, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { QAResponse } from '@/components/manifesto/QAResponse';

interface Candidate {
  id: string;
  name: string;
  position: string;
}

interface ManifestoQAChatProps {
  electionId: string;
  candidates: Candidate[];
  selectedCandidates: string[];
  onCandidateSelect: (candidateIds: string[]) => void;
}

interface QAResult {
  answer: string;
  sources: Array<{
    candidateId: string;
    candidateName: string;
    position: string;
    content: string;
    similarity: number;
  }>;
  totalSources: number;
  question: string;
  timestamp: Date;
}

export function ManifestoQAChat({ 
  electionId, 
  candidates, 
  selectedCandidates, 
  onCandidateSelect 
}: ManifestoQAChatProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<QAResult[]>([]);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/manifesto-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId,
          question: question.trim(),
          candidateIds: selectedCandidates.length > 0 ? selectedCandidates : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to process question');
      }

      const qaResult: QAResult = {
        ...result.data,
        question: question.trim(),
        timestamp: new Date(),
      };

      setQaHistory(prev => [qaResult, ...prev]);
      setQuestion('');
      toast.success('Question processed successfully!');

    } catch (error) {
      console.error('Error asking question:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const selectAllCandidates = () => {
    onCandidateSelect(candidates.map(c => c.id));
  };

  const clearSelection = () => {
    onCandidateSelect([]);
  };

  return (
    <div className="space-y-6">
      {/* Question Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Ask About Candidate Manifestos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Candidate Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Ask about specific candidates (optional):
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllCandidates}
                  disabled={selectedCandidates.length === candidates.length}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  disabled={selectedCandidates.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedCandidates.length === 0 ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  All Candidates
                </Badge>
              ) : (
                selectedCandidates.map(candidateId => {
                  const candidate = candidates.find(c => c.id === candidateId);
                  return candidate ? (
                    <Badge key={candidateId} variant="default" className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {candidate.name}
                    </Badge>
                  ) : null;
                })
              )}
            </div>
          </div>

          {/* Question Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Ask anything about the candidates' manifestos... (e.g., 'What are their positions on student housing?', 'How do they plan to improve campus facilities?')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Press Ctrl+Enter or Cmd+Enter to submit
              </p>
              <Button 
                onClick={handleAskQuestion}
                disabled={isLoading || !question.trim()}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Ask
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Q&A History */}
      {qaHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Questions & Answers</h3>
          {qaHistory.map((qa, index) => (
            <QAResponse key={index} qa={qa} />
          ))}
        </div>
      )}
    </div>
  );
}