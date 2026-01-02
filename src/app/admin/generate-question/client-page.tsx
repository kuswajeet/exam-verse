"use client";

import { useActionState, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { generateQuestionsAction, FormState } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrainCircuit, CheckCircle, Copy, Loader, Save, Terminal, XCircle, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Question } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore } from "@/firebase";
import { writeBatch, doc, collection } from "firebase/firestore";

const initialState: FormState = {
  status: "idle",
  data: null,
  message: "",
};

export function GenerateQuestionClientPage() {
  const [state, formAction, isGenerating] = useActionState(generateQuestionsAction, initialState);
  const { toast } = useToast();
  const firestore = useFirestore();

  const [editableQuestions, setEditableQuestions] = useState<Question[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  useState(() => {
    if(state.status === 'success' && state.data) {
        setEditableQuestions(state.data.questions);
    }
  });


  const handleQuestionChange = (index: number, field: keyof Question, value: string | number) => {
    if (!editableQuestions) return;

    const newQuestions = [...editableQuestions];
    (newQuestions[index] as any)[field] = value;
    setEditableQuestions(newQuestions);
  };
  
  const handleSaveToFirestore = async () => {
    if (!editableQuestions || !firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No questions to save or database not available.",
        });
        return;
    }

    setIsSaving(true);
    try {
        const batch = writeBatch(firestore);
        const questionsRef = collection(firestore, "questions");

        editableQuestions.forEach((question) => {
            const questionId = `gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const docRef = doc(questionsRef, questionId);
            batch.set(docRef, {
                ...question,
                id: questionId, // Ensure the ID is part of the document data
                questionType: 'single_choice', // default
            });
        });

        await batch.commit();

        toast({
            title: "Success!",
            description: `${editableQuestions.length} questions have been saved to Firestore.`,
            className: "bg-green-100 dark:bg-green-900"
        });
        setEditableQuestions(null); // Clear the form
    } catch (error) {
        console.error("Error saving questions to Firestore:", error);
        toast({
            variant: "destructive",
            title: "Firestore Error",
            description: error instanceof Error ? error.message : "Could not save questions.",
        });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <div className="grid gap-6">
      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Question Generation Parameters</CardTitle>
            <CardDescription>
              Fill in the details to generate a batch of questions using AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input id="topic" name="topic" placeholder="e.g., Photosynthesis" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examName">Exam Name</Label>
                  <Input id="examName" name="examName" placeholder="e.g., SAT Biology" required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select name="difficulty" defaultValue="medium" required>
                        <SelectTrigger id="difficulty"><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="count">Number of Questions</Label>
                    <Select name="count" defaultValue="5" required>
                        <SelectTrigger id="count"><SelectValue placeholder="Select count" /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
              ) : (
                <>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Generate Questions
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {state.status === 'idle' && (
        <Card className="flex flex-col items-center justify-center min-h-[400px]">
            <CardContent className="text-center p-6">
                <BrainCircuit className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Generated questions will appear here for review.</p>
            </CardContent>
        </Card>
      )}
      
      {state.status === "error" && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
      )}

      {editableQuestions && editableQuestions.length > 0 && (
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Review Generated Questions</CardTitle>
                        <CardDescription>Edit any question details below before saving to the database.</CardDescription>
                    </div>
                     <Button onClick={handleSaveToFirestore} disabled={isSaving}>
                        {isSaving ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save to Firestore</>}
                    </Button>
                </div>
                 {state.message.includes('mock') && (
                    <Alert variant="default" className="mt-4 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-300 [&>svg]:text-amber-600">
                        <FileWarning className="h-4 w-4" />
                        <AlertTitle>Fallback Data</AlertTitle>
                        <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {editableQuestions.map((q, index) => (
                    <div key={q.id || index} className="p-4 border rounded-lg space-y-3 bg-muted/50">
                        <Label htmlFor={`qtext-${index}`}>Question {index+1}</Label>
                        <Textarea id={`qtext-${index}`} value={q.questionText} onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)} rows={3} />
                        
                        <Label>Options</Label>
                        <div className="grid grid-cols-2 gap-2">
                           {q.options.map((opt, optIndex) => (
                               <Input key={optIndex} value={opt} onChange={(e) => {
                                   const newOptions = [...q.options];
                                   newOptions[optIndex] = e.target.value;
                                   handleQuestionChange(index, 'options', newOptions as any);
                               }}/>
                           ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor={`correct-idx-${index}`}>Correct Answer Index</Label>
                                <Input id={`correct-idx-${index}`} type="number" value={q.correctAnswerIndex} onChange={(e) => handleQuestionChange(index, 'correctAnswerIndex', parseInt(e.target.value))} />
                            </div>
                             <div>
                                <Label htmlFor={`difficulty-${index}`}>Difficulty</Label>
                                <Select value={q.difficulty} onValueChange={(value) => handleQuestionChange(index, 'difficulty', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                        
                        <Label htmlFor={`explanation-${index}`}>Explanation</Label>
                        <Textarea id={`explanation-${index}`} value={q.explanation} onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)} rows={3} />
                    </div>
                ))}
            </CardContent>
             <CardFooter>
                 <Button onClick={handleSaveToFirestore} disabled={isSaving}>
                    {isSaving ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save to Firestore</>}
                </Button>
            </CardFooter>
          </Card>
      )}

    </div>
  );
}
