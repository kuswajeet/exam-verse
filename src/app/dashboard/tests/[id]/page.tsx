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
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function TestTakerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [test, setTest] = useState(() => mockTests.find(t => t.id === params.id));
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(test ? test.durationMinutes * 60 : 0);
  const [testFinished, setTestFinished] = useState(false);

  useEffect(() => {
    if (!test) {
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test]);

  if (!test) {
    notFound();
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };
  
  const finishTest = () => {
    setTestFinished(true);
    // In a real app, you'd save the results here and navigate to the results page
    // For now, we just show a confirmation.
    const newAttemptId = `attempt${Date.now()}`;
    router.push(`/dashboard/results/${newAttemptId}`);
    // This is a mock. A real app would have the result ready.
  }

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
                            You won't be able to change your answers after submitting.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogAction onClick={finishTest}>Submit</AlertDialogAction>
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
