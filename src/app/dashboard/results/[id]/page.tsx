import { mockTestAttempts, mockTests } from "@/lib/placeholder-data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResultDetailPage({ params }: { params: { id: string } }) {
  const attempt = mockTestAttempts.find(a => a.id === params.id);

  if (!attempt) {
    notFound();
  }
  
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
          <CardDescription>Completed on {attempt.completedAt.toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center justify-center space-y-2 p-4 rounded-lg bg-muted">
            <span className="text-sm font-medium text-muted-foreground">Score</span>
            <span className="text-4xl font-bold">{attempt.score}/{attempt.totalQuestions}</span>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 p-4 rounded-lg bg-muted">
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
                            <AccordionContent className="space-y-4">
                               <div className="grid gap-2">
                                    {question.options.map((option, optionIndex) => {
                                        const isUserAnswer = optionIndex === userAnswerIndex;
                                        const isCorrectAnswer = optionIndex === question.correctAnswerIndex;
                                        return (
                                            <div key={optionIndex} className={cn("flex items-center gap-2 p-2 rounded-md text-sm", 
                                                isCorrectAnswer && "bg-green-100 dark:bg-green-900/50",
                                                isUserAnswer && !isCorrectAnswer && "bg-red-100 dark:bg-red-900/50"
                                            )}>
                                                {isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />}
                                                {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />}
                                                {!isCorrectAnswer && !isUserAnswer && <div className="h-4 w-4" />}
                                                <span>{option}</span>
                                            </div>
                                        );
                                    })}
                               </div>
                                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Explanation</h4>
                                        <p className="text-muted-foreground text-blue-700 dark:text-blue-400">{question.explanation}</p>
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
