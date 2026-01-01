'use client';

import { notFound, useRouter } from "next/navigation";
import { mockTests } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
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
    // This could be a brief state before loading, or the doc doesn't exist
    // You might want a more specific "Not Found" message if loading is complete and still no data
    return <p>Result not found.</p>;
  }
  
  // For now, we still get the questions from mock data.
  // In a real app, questions would be fetched from Firestore based on testId.
  const test = mockTests.find(t => t.id === attempt.testId);

  if (!test) {
    notFound();
  }

  const accuracy = (attempt.score / attempt.totalQuestions) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Results for: {attempt.testTitle}</CardTitle>
          <CardDescription>Completed on {format(new Date(attempt.completedAt.seconds * 1000), "PPP")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center justify-center space-y-2 p-4 rounded-lg bg-muted">
            <span className="text-sm font-medium text-muted-foreground">Score</span>
            <span className="text-4xl font-bold">{attempt.score}/{attempt.totalQuestions}</span>
          </div>
          <div className="flex flex-col justify-center space-y-2 p-4 rounded-lg bg-muted">
            <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
            <div className="w-full space-y-2">
                <span className="text-4xl font-bold">{accuracy.toFixed(1)}%</span>
                <Progress value={accuracy} aria-label={`${accuracy.toFixed(1)}% accuracy`} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 p-4 rounded-lg bg-muted">
            <span className="text-sm font-medium text-muted-foreground">Time Taken</span>
             <span className="text-4xl font-bold">4m 32s</span>
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
                    const isCorrect = userAnswerIndex === question.correctAnswerIndex;
                    return (
                        <AccordionItem value={`item-${index}`} key={question.id}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-4 text-left">
                                    {isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                                    <span className="flex-grow">{index + 1}. {question.questionText}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                               <div className="grid gap-2">
                                    {question.options.map((option, optionIndex) => {
                                        const isUserAnswer = optionIndex === userAnswerIndex;
                                        const isCorrectAnswer = optionIndex === question.correctAnswerIndex;
                                        return (
                                            <div key={optionIndex} className={cn("flex items-center gap-3 p-3 rounded-lg text-sm", 
                                                isCorrectAnswer && "bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800",
                                                isUserAnswer && !isCorrectAnswer && "bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800",
                                                !isCorrectAnswer && !isUserAnswer && "border"
                                            )}>
                                                {isCorrectAnswer ? <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" /> 
                                                : isUserAnswer ? <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                : <div className="h-5 w-5" />
                                                }
                                                <span>{option}</span>
                                            </div>
                                        );
                                    })}
                               </div>
                                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Explanation</h4>
                                        <p className="text-muted-foreground text-sm text-blue-700 dark:text-blue-400">{question.explanation}</p>
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
