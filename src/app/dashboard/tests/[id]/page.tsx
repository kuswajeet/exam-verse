"use client";

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { mockTests } from '@/lib/placeholder-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check, Clock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import type { Test, TestAttempt } from '@/lib/types';
import { doc, collection, serverTimestamp } from 'firebase/firestore';

export default function TestTakerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  // For now, we will use mock data for the test itself, but save results to firestore
  const [test] = useState(() => mockTests.find(t => t.id === params.id));
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(test ? test.durationMinutes * 60 : 0);
  
  const finishTest = async () => {
    if (!user || !firestore || !test) return;

    const score = Object.keys(userAnswers).reduce((acc, qId) => {
      const question = test.questions.find(q => q.id === qId);
      if (question && question.correctAnswerIndex === userAnswers[qId]) {
        return acc + 1;
      }
      return acc;
    }, 0);
    
    const resultsCollection = collection(firestore, 'users', user.uid, 'results');
    
    const attemptData: Omit<TestAttempt, 'id' | 'completedAt'> & { completedAt: any } = {
      userId: user.uid,
      testId: test.id,
      testTitle: test.title,
      answers: userAnswers,
      score: score,
      totalQuestions: test.questions.length,
      completedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDocumentNonBlocking(resultsCollection, attemptData);
      // addDocumentNonBlocking returns a promise that resolves with the doc ref on success.
      if (docRef) {
        router.push(`/dashboard/results/${docRef.id}`);
      } else {
        // Fallback in case docRef is not returned, though it should be.
        // This is less ideal as it doesn't lead to the specific result.
        router.push(`/dashboard/results`);
      }
    } catch (error) {
        // If addDocumentNonBlocking was changed to throw, this would catch it.
        // But with the current non-blocking setup, errors are emitted globally.
        // We can still push the user away from the test page on any submission attempt.
        console.error("Submission failed, navigating to results page.");
        router.push(`/dashboard/results`);
    }
  }

  useEffect(() => {
    if (!test || timeLeft <= 0) {
        if(timeLeft <= 0) {
            finishTest();
        }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, timeLeft]);

  if (!test) {
    notFound();
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{test.title}</CardTitle>
              <CardDescription>{test.subject}</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-lg font-medium text-destructive">
                <Clock className="h-5 w-5" />
                <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
              <p className="font-semibold text-lg mb-4">{currentQuestionIndex + 1}. {currentQuestion.questionText}</p>
              <RadioGroup
                value={userAnswers[currentQuestion.id]?.toString()}
                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
                className="space-y-2"
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer p-3 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors has-[[data-state=checked]]:bg-primary has-[[data-state=checked]]:text-primary-foreground">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
                <Button 
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    disabled={currentQuestionIndex === 0}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {currentQuestionIndex < test.questions.length - 1 ? (
                    <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" className="bg-green-600 hover:bg-green-700">
                          <Check className="mr-2 h-4 w-4" /> Finish Test
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You won't be able to change your answers after submitting. Your test will be graded.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={finishTest} className="bg-green-600 hover:bg-green-700">Submit</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
