'use client';

import { useState, useEffect, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check, Clock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import type { Test, TestWithQuestions, Question, TestAttempt } from '@/lib/types';
import { doc, collection, serverTimestamp, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

async function getTestWithQuestions(firestore: any, testId: string): Promise<TestWithQuestions | null> {
    const testRef = doc(firestore, 'tests', testId);
    const testSnapshot = await getDocs(query(collection(firestore, 'tests'), where('__name__', '==', testId)));
    
    if (testSnapshot.empty) {
        return null;
    }

    const testData = { id: testSnapshot.docs[0].id, ...testSnapshot.docs[0].data() } as Test;
    
    if (!testData.questionIds || testData.questionIds.length === 0) {
        return { ...testData, questions: [] };
    }
    
    // Firestore 'in' queries are limited to 30 elements. 
    // If a test can have more, this needs to be chunked.
    const questionsQuery = query(collection(firestore, 'questions'), where('__name__', 'in', testData.questionIds));
    const questionsSnapshot = await getDocs(questionsQuery);

    // This ensures question order is preserved from the test document
    const questionsMap = new Map(questionsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() } as Question]));
    const questions = testData.questionIds.map(id => questionsMap.get(id)).filter((q): q is Question => !!q);
    
    return { ...testData, questions };
}


export default function TestTakerPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [test, setTest] = useState<TestWithQuestions | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(true);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!firestore) return;
    const fetchTest = async () => {
        setIsLoadingTest(true);
        const testWithQuestions = await getTestWithQuestions(firestore, id);
        setTest(testWithQuestions);
        if (testWithQuestions) {
            setTimeLeft(testWithQuestions.durationMinutes * 60);
        }
        setIsLoadingTest(false);
    }
    fetchTest();
  }, [firestore, id]);
  
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
      // Non-blocking will resolve to undefined on client, but the onSnapshot listener for results will pick it up
      // We can redirect to the results page, or to the specific result if we can get the ID.
      // For now, redirecting to the main results list is safest.
      router.push(`/dashboard/results`);
    } catch (error) {
        console.error("Submission failed, navigating to results page.");
        router.push(`/dashboard/results`);
    }
  }

  useEffect(() => {
    if (!test || timeLeft <= 0) {
        if(test && timeLeft <= 0 && currentQuestionIndex > 0) { // check current question to avoid trigger on load
            finishTest();
        }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          finishTest(); // Auto-submit when time is up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, timeLeft]);

  if (isLoadingTest) {
      return (
        <div className="flex gap-6">
            <div className="w-3/4 space-y-4">
              <Card>
                  <CardHeader>
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full mt-4" />
                  </CardHeader>
                  <CardContent className="space-y-8">
                       <div className="space-y-4">
                           <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                       </div>
                       <div className="flex justify-between items-center pt-4 border-t">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                       </div>
                  </CardContent>
              </Card>
            </div>
             <div className="w-1/4">
                <Card>
                    <CardHeader>
                        <CardTitle>Question Palette</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-5 gap-2">
                        {Array.from({length: 20}).map((_, i) => (
                             <Skeleton key={i} className="h-10 w-10" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
      )
  }

  if (!test || !test.questions || test.questions.length === 0) {
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
    <div className="flex gap-6">
      <div className="w-3/4">
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
      <div className="w-1/4">
        <Card>
            <CardHeader>
                <CardTitle>Question Palette</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-5 gap-2">
                {test.questions.map((q, index) => (
                    <Button
                        key={q.id}
                        variant={currentQuestionIndex === index ? "default" : userAnswers[q.id] !== undefined ? "outline" : "secondary"}
                        className={cn(
                            "h-10 w-10 p-0",
                            currentQuestionIndex === index && "bg-accent text-accent-foreground",
                            userAnswers[q.id] !== undefined && currentQuestionIndex !== index && "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 border-green-300",
                        )}
                        onClick={() => setCurrentQuestionIndex(index)}
                    >
                        {index + 1}
                    </Button>
                ))}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
