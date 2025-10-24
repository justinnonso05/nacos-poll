'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { QAResponse } from './QAResponse';

interface Candidate {
  id: string;
  name: string;
  position: string;
}

interface FrequentlyAskedProps {
  electionId: string;
  candidates: Candidate[];
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

const FREQUENT_QUESTIONS = [
  "What are the candidates' positions on student housing and accommodation?",
  "How do candidates plan to improve campus facilities and infrastructure?",
  "What are their proposals for student financial support and scholarships?",
  "How will they enhance student mental health and wellbeing services?",
  "What are their plans for improving academic support and library services?",
  "How do they plan to increase student engagement and campus activities?",
  "What are their positions on student transportation and parking?",
  "How will they improve communication between students and administration?",
  "What are their plans for sustainability and environmental initiatives?",
  "How will they support international students and diversity initiatives?",
];

export function FrequentlyAsked({ electionId, candidates }: FrequentlyAskedProps) {
  const [loadingQuestion, setLoadingQuestion] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<QAResult[]>([]);

  const handleQuestionClick = async (question: string) => {
    if (loadingQuestion) return;

    setLoadingQuestion(question);
    try {
      const response = await fetch('/api/ai/manifesto-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId,
          question,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to process question');
      }

      const qaResult: QAResult = {
        ...result.data,
        question,
        timestamp: new Date(),
      };

      setAnsweredQuestions(prev => [qaResult, ...prev.filter(q => q.question !== question)]);
      toast.success('Question answered!');

    } catch (error) {
      console.error('Error processing question:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process question');
    } finally {
      setLoadingQuestion(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* FAQ Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on any question to get AI-powered answers from all candidate manifestos.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {FREQUENT_QUESTIONS.map((question, index) => {
              const isLoading = loadingQuestion === question;
              const isAnswered = answeredQuestions.some(q => q.question === question);
              
              return (
                <Button
                  key={index}
                  variant={isAnswered ? "secondary" : "outline"}
                  className="justify-start text-left h-auto p-3 whitespace-normal"
                  onClick={() => handleQuestionClick(question)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
                  ) : (
                    <HelpCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  )}
                  <span className="text-sm">{question}</span>
                  {isAnswered && (
                    <span className="ml-auto text-xs text-green-600 dark:text-green-400">
                      ✓ Answered
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Answered Questions */}
      {answeredQuestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Answers</h3>
          {answeredQuestions.map((qa, index) => (
            <QAResponse key={index} qa={qa} />
          ))}
        </div>
      )}
    </div>
  );
}