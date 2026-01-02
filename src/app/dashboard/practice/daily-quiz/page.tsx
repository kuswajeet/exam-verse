
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy, startAt, doc } from 'firebase/firestore';
import type { Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, CheckCircle2, XCircle, RefreshCw, Trophy, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const QUIZ_LENGTH = 5;

export default function DailyQuizPage() {
  const firestore = useFirestore();
  const [quizId, setQuizId] = useState(0); // Used to refetch a new quiz
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch random questions
  useEffect(() => {
    if (!firestore) return;
    setIsLoading(true);

    const fetchQuestions = async () => {
      // Create a random document ID to start the query from
      const randomDocId = doc(collection(firestore, 'questions')).id;
      
      const questionsQuery = query(
        collection(firestore, 'questions'),
        orderBy('__name__'),
        startAt(randomDocId),
        limit(QUIZ_LENGTH)
      );

      const unsubscribe = (await import('firebase/firestore')).onSnapshot(questionsQuery, (snapshot) => {
        const fetchedQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
        
        // If we get fewer than 5, try fetching from the start of the collection
        if (fetchedQuestions.length < QUIZ_LENGTH) {
            const fallbackQuery = query(collection(firestore, 'questions'), limit(QUIZ_LENGTH));
            (import('firebase/firestore')).then(({getDocs}) => getDocs(fallbackQuery)).then(fallbackSnapshot => {
                setQuestions(fallbackSnapshot.docs.map(d => ({id: d.id, ...d.data()}) as Question[]));
            });
        } else {
            setQuestions(fetchedQuestions);
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching daily quiz questions:", error);
        setIsLoading(false);
      });
      
      return () => unsubscribe();
    };

    fetchQuestions();

  }, [firestore, quizId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

   useEffect(() => {
    if (isFinished || isLoading) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, isLoading]);


  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(optionIndex);
    setIsAnswered(true);
    if (optionIndex === questions[currentIndex].correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      handleFinish();
    }
  };
  
  const handleFinish = () => {
    setIsFinished(true);
  }

  const handleRestart = () => {
    setQuizId(prev => prev + 1);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setTimeLeft(120);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
            <Skeleton className="h-80 w-full max-w-2xl" />
        </div>
    )
  }
  
  if (!questions || questions.length === 0) {
    return (
        <Card className="max-w-2xl mx-auto mt-10 text-center">
            <CardHeader>
                <CardTitle>Could Not Load Quiz</CardTitle>
                <CardDescription>
                    We couldn't find any questions to build a quiz. Please check back later.
                </CardDescription>
            </CardHeader>
        </Card>
    )
  }
  
  if(isFinished) {
    return (
        <div className="flex items-center justify-center h-full">
             <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <Trophy className="h-12 w-12 mx-auto text-amber-400" />
                    <CardTitle className="text-2xl mt-4">Quiz Complete!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You scored</p>
                    <p className="text-6xl font-bold my-2">{score}<span className="text-3xl text-muted-foreground">/{QUIZ_LENGTH}</span></p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleRestart} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Another Quiz
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / QUIZ_LENGTH) * 100;

  return (
    <div className="flex flex-col items-center p-4 h-full">
        <div className="w-full max-w-2xl">
            <h1 className="text-2xl font-bold text-center mb-4">Daily Quiz</h1>
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-muted-foreground">Question {currentIndex + 1} of {QUIZ_LENGTH}</p>
                         <div className={cn("flex items-center gap-2 text-sm font-medium", timeLeft < 30 && "text-destructive")}>
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                    <Progress value={progress} />
                </CardHeader>
                <CardContent className="min-h-[250px]">
                    <p className="text-lg font-semibold mb-4">{currentQuestion.questionText}</p>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isCorrect = index === currentQuestion.correctAnswerIndex;
                            const isSelected = index === selectedAnswer;

                            return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="lg"
                                    className={cn("w-full justify-start h-auto py-3",
                                        isAnswered && isCorrect && "bg-green-100 border-green-300 text-green-800 hover:bg-green-100 dark:bg-green-900/50 dark:border-green-700 dark:text-green-200",
                                        isAnswered && isSelected && !isCorrect && "bg-red-100 border-red-300 text-red-800 hover:bg-red-100 dark:bg-red-900/50 dark:border-red-700 dark:text-red-200"
                                    )}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={isAnswered}
                                >
                                    <div className="flex-1 text-left whitespace-normal">{option}</div>
                                    {isAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 ml-4 text-green-600" />}
                                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 ml-4 text-red-600" />}
                                </Button>
                            )
                        })}
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    {isAnswered && (
                         <Button onClick={handleNext}>
                            {currentIndex === QUIZ_LENGTH - 1 ? 'Finish' : 'Next'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
