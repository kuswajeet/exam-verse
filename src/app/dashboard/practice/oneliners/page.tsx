
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Lightbulb, Zap, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OneLinersPage() {
  const firestore = useFirestore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // We add a key to the query to force a refetch when the user clicks "New Pack"
  const [queryKey, setQueryKey] = useState(0); 

  const oneLinersQuery = useMemoFirebase(() => 
    firestore 
      ? query(
          collection(firestore, 'questions'), 
          where('questionType', '==', 'one_liner'),
          // WARNING: This random query is inefficient. For production, a better strategy
          // would be to fetch documents by a random ID or use a dedicated API.
          // where('__name__', '>=', doc(collection(firestore, 'questions')).id),
          limit(20)
        )
      : null, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firestore, queryKey]
  );
  
  const { data: questions, isLoading } = useCollection<Question>(oneLinersQuery);

  const handleNext = () => {
    setShowAnswer(false);
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setShowAnswer(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNewPack = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setQueryKey(prev => prev + 1);
  }

  const currentQuestion = questions?.[currentIndex];

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
            <Skeleton className="h-72 w-full max-w-2xl" />
            <div className="flex gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    )
  }
  
  if (!questions || questions.length === 0) {
    return (
        <Card className="max-w-2xl mx-auto mt-10 text-center">
            <CardHeader>
                <CardTitle>No "One-Liner" Questions Found</CardTitle>
                <CardDescription>
                    We couldn't find any questions marked as 'one_liner'. Admins can add some in the question management section.
                </CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
        <div className="w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="text-primary"/> One-Liner Practice
                </h1>
                <Button onClick={handleNewPack} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4"/>
                    New Pack
                </Button>
            </div>
            
            <div key={currentIndex}>
                <Card className="min-h-[350px] flex flex-col justify-between shadow-lg transition-all duration-300">
                    <CardHeader>
                            <CardDescription>Question {currentIndex + 1} of {questions.length}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center text-center">
                        <p className="text-xl md:text-2xl font-semibold">
                            {currentQuestion?.questionText}
                        </p>
                    </CardContent>
                    <CardFooter className="flex-col items-center gap-4">
                        {!showAnswer ? (
                            <Button onClick={() => setShowAnswer(true)} className="w-full max-w-xs">Show Answer</Button>
                        ) : (
                            <div
                                className="w-full p-4 bg-muted rounded-lg space-y-3 animate-in fade-in duration-300"
                            >
                                <div className="flex items-start gap-3">
                                        <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Answer</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-400">{currentQuestion?.options[currentQuestion.correctAnswerIndex]}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                        <Lightbulb className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-green-800 dark:text-green-300">Explanation</h4>
                                        <p className="text-sm text-green-700 dark:text-green-400">{currentQuestion?.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>

             <div className="flex justify-between items-center mt-6">
                <Button onClick={handlePrevious} variant="outline" disabled={currentIndex === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button onClick={handleNext} disabled={currentIndex === questions.length - 1}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    </div>
  );
}
