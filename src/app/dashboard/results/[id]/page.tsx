'use client';

import { notFound } from "next/navigation";
import { mockTests } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { TestAttempt } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ResultDetailPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const resultDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, `users/${user.uid}/results`, params.id) : null),
    [user, firestore, params.id]
  );
  
  const { data: attempt, isLoading: isLoadingAttempt } = useDoc<TestAttempt>(resultDocRef);

  if (isLoadingAttempt) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
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
  
  // For now, we still get the questions from mock data.
  // In a real app, questions would be fetched from Firestore based on testId.
  const test = mockTests.find(t => t.id === attempt.testId);

  if (!test) {
    notFound();
  }

  const accuracy = (attempt.score / attempt.totalQuestions) * 100;
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
