
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMockTestById } from '@/lib/mock-data';
import type { TestWithQuestions } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Clock, HelpCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function TestPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id: testId } = React.use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  
  const [test, setTest] = useState<TestWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!testId) return;

    async function fetchTest() {
      try {
        setIsLoading(true);
        const testData = await getMockTestById(testId);
        if (testData) {
          setTest(testData);
          setTimeLeft(testData.durationMinutes * 60);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Mock test not found.' });
        }
      } catch (error) {
        console.error('Error fetching mock test:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load the mock test.' });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTest();
  }, [testId, toast]);

  // Timer effect
  useEffect(() => {
    if (isLoading || timeLeft <= 0 || isSubmitting) return;

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    if (timeLeft <= 1) {
      clearInterval(timerId);
      handleSubmit(); // Auto-submit when time is up
    }

    return () => clearInterval(timerId);
  }, [timeLeft, isLoading, isSubmitting]);

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!test || isSubmitting) return;
    setIsSubmitting(true);
    
    let score = 0;
    for (const question of test.questions) {
      if (selectedAnswers[question.id] === question.correctAnswerIndex) {
        score++;
      }
    }
    
    // Mock Submission: Save to localStorage
    const resultId = `result-${test.id}-${Date.now()}`;
    const resultData = {
      id: resultId,
      userId: 'mock-user-1',
      testId: test.id,
      testTitle: test.title,
      answers: selectedAnswers,
      score: score,
      totalQuestions: test.questions.length,
      accuracy: (score / test.questions.length) * 100,
      completedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('latestTestResult', JSON.stringify(resultData));
    
    toast({ title: "Test Submitted!", description: `Your score: ${score}/${test.questions.length}. Redirecting...` });
    
    // Wait a bit for the toast to be seen
    setTimeout(() => {
        setIsSubmitting(false);
        router.push(`/dashboard/results`);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </header>
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="flex-grow space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-10 w-10" />)}
              </CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return <div className="text-center py-10">Test not found or could not be loaded.</div>;
  }

  if (!test.questions || !Array.isArray(test.questions) || test.questions.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center">
              <Card className="w-full max-w-md">
                  <CardHeader>
                      <CardTitle className="text-destructive">Data Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p>Data Corrupted: No questions were found for this test. Please contact an administrator.</p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => router.back()}>Go Back</Button>
                  </CardFooter>
              </Card>
          </div>
      );
  }
  
  const currentQuestion = test.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <h1 className="text-xl font-bold truncate">{test.title}</h1>
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-lg",
          timeLeft < 60 ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" : "bg-muted text-muted-foreground"
        )}>
          <Clock className="h-5 w-5" />
          <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
      </header>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Left Column: Question */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Question {currentQuestionIndex + 1} of {test.questions.length}</CardTitle>
              {currentQuestion.sourceExamName && currentQuestion.previousYear && (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/50 dark:text-yellow-200 mt-2 w-fit">
                    <HelpCircle className="mr-2 h-3 w-3" />
                    {currentQuestion.sourceExamName} {currentQuestion.previousYear}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
                <p className="text-lg leading-relaxed">{currentQuestion.questionText}</p>
                <RadioGroup
                    value={String(selectedAnswers[currentQuestion.id])}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, Number(value))}
                    className="space-y-3"
                >
                    {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300 dark:has-[:checked]:bg-blue-900/30 dark:has-[:checked]:border-blue-700 transition-colors">
                            <RadioGroupItem value={String(index)} id={`q${currentQuestion.id}-o${index}`} />
                            <Label htmlFor={`q${currentQuestion.id}-o${index}`} className="text-base flex-1 cursor-pointer">{option}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>Previous</Button>
                <Button onClick={() => setCurrentQuestionIndex(prev => Math.min(test.questions.length - 1, prev + 1))} disabled={currentQuestionIndex === test.questions.length - 1}>Next</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Palette & Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Question Palette</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-5 gap-2">
              {test.questions.map((q, index) => (
                <Button
                  key={q.id}
                  variant={currentQuestionIndex === index ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={cn(
                    selectedAnswers[q.id] !== undefined && currentQuestionIndex !== index && "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700",
                  )}
                >
                  {index + 1}
                </Button>
              ))}
            </CardContent>
            <CardFooter>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full" variant="destructive" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                            Submit Test
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will end the test and submit your answers. You cannot change them after submitting.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

    