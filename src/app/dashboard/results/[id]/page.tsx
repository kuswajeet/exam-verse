'use client';

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, HelpCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TestAttempt, Question, TestWithQuestions } from "@/lib/types";
import { getMockTestById } from "@/lib/mock-data";
import { format } from "date-fns";

// The same hardcoded attempts from the results list page, to act as a fallback DB
const MOCK_PAST_ATTEMPTS: TestAttempt[] = [
    {
        id: 'mock-attempt-1',
        userId: 'mock-user-1',
        testId: 'test-hist',
        testTitle: 'History Special',
        answers: { 'hist-q1': 1, 'hist-q2': 2, 'hist-q3': 0, 'hist-q4': 2, 'hist-q5': 1 },
        score: 3,
        totalQuestions: 5,
        accuracy: 60.0,
        completedAt: { seconds: Math.floor(new Date('2024-05-10T10:00:00Z').getTime() / 1000), nanoseconds: 0 } as any,
    },
    {
        id: 'mock-attempt-2',
        userId: 'mock-user-1',
        testId: 'test-math',
        testTitle: 'Math Basics',
        answers: { 'math-q1': 1, 'math-q2': 2, 'math-q3': 1, 'math-q4': 2, 'math-q5': 2 },
        score: 5,
        totalQuestions: 5,
        accuracy: 100.0,
        completedAt: { seconds: Math.floor(new Date('2024-05-15T11:30:00Z').getTime() / 1000), nanoseconds: 0 } as any,
    }
];

// Helper to find the attempt data from localStorage or mock array
async function getMockAttemptById(id: string): Promise<TestAttempt | undefined> {
    const latestResultString = localStorage.getItem('latestTestResult');
    if (latestResultString) {
        const latestResult = JSON.parse(latestResultString);
        if (latestResult.id === id) {
             // Ensure the date is in a consistent format
            latestResult.completedAt = { seconds: Math.floor(new Date(latestResult.completedAt).getTime() / 1000), nanoseconds: 0 };
            return latestResult;
        }
    }
    return MOCK_PAST_ATTEMPTS.find(attempt => attempt.id === id);
}


export default function ResultDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(paramsPromise);
  
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [test, setTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    async function fetchData() {
        setIsLoading(true);
        const attemptData = await getMockAttemptById(id);
        if (attemptData) {
            setAttempt(attemptData);
            const testData = await getMockTestById(attemptData.testId);
            setTest(testData || null);
        }
        setIsLoading(false);
    }
    fetchData();

  }, [id]);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }
  
  if (!attempt) {
    return <p className="text-center text-muted-foreground">Result not found. It might still be processing, or the link is invalid.</p>;
  }
  
  if (!test || !test.questions) {
     return <p className="text-center text-muted-foreground">Could not load the questions for this test result.</p>;
  }

  const accuracy = attempt.accuracy || (attempt.score / attempt.totalQuestions) * 100;
  const questionsAnswered = Object.keys(attempt.answers).length;
  const wrongAnswers = questionsAnswered - attempt.score;
  const skippedAnswers = attempt.totalQuestions - questionsAnswered;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Results for: {attempt.testTitle}</CardTitle>
          {attempt.completedAt && <CardDescription>Completed on {format(new Date(attempt.completedAt.seconds * 1000), "PPP")}</CardDescription>}
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center justify-center space-y-2 p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <span className="text-sm font-medium text-green-800 dark:text-green-300">Correct</span>
            <span className="text-4xl font-bold text-green-600 dark:text-green-400">{attempt.score}</span>
          </div>
           <div className="flex flex-col items-center justify-center space-y-2 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <span className="text-sm font-medium text-red-800 dark:text-red-300">Wrong</span>
            <span className="text-4xl font-bold text-red-600 dark:text-red-400">{wrongAnswers}</span>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Skipped</span>
            <span className="text-4xl font-bold text-gray-600 dark:text-gray-400">{skippedAnswers}</span>
          </div>
          <div className="flex flex-col justify-center space-y-2 p-4 rounded-lg bg-muted">
            <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
            <div className="w-full space-y-2">
                <span className="text-4xl font-bold">{accuracy.toFixed(1)}%</span>
                <Progress value={accuracy} aria-label={`${accuracy.toFixed(1)}% accuracy`} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
            <CardDescription>Review each question to understand your mistakes.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {test.questions.map((question, index) => {
                    const userAnswerIndex = attempt.answers[question.id];
                    const wasAnswered = userAnswerIndex !== undefined;
                    const isCorrect = wasAnswered && userAnswerIndex === question.correctAnswerIndex;

                    return (
                        <AccordionItem value={`item-${index}`} key={question.id}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-4 text-left">
                                    {isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" /> 
                                    : wasAnswered ? <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                    : <HelpCircle className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                    }
                                    <span className="flex-grow">{index + 1}. {question.questionText}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                               <div className="grid gap-2">
                                    {question.options.map((option, optionIndex) => {
                                        const isUserAnswer = optionIndex === userAnswerIndex;
                                        const isCorrectAnswer = optionIndex === question.correctAnswerIndex;
                                        return (
                                            <div key={optionIndex} className={cn("flex items-center gap-3 p-3 rounded-lg text-sm border", 
                                                isCorrectAnswer && "bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800",
                                                isUserAnswer && !isCorrectAnswer && "bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-800",
                                                !isUserAnswer && !isCorrectAnswer && "bg-card"
                                            )}>
                                                {isCorrectAnswer ? <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" /> 
                                                : isUserAnswer ? <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                : <div className="h-5 w-5" />
                                                }
                                                <span>{option}</span>
                                                {isCorrectAnswer && !isUserAnswer && wasAnswered && <span className="ml-auto text-xs text-green-700 dark:text-green-300 font-semibold">(Correct Answer)</span>}
                                                {isUserAnswer && !isCorrectAnswer && <span className="ml-auto text-xs text-red-700 dark:text-red-300 font-semibold">(Your Answer)</span>}

                                            </div>
                                        );
                                    })}
                               </div>
                                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Explanation</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-400">{question.explanation}</p>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
