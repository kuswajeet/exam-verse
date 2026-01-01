"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Loader, Terminal, Upload } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Papa from "papaparse";
import { useFirestore } from "@/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import type { Question } from "@/lib/types";

type FormState = {
  status: "success" | "error" | "idle";
  data: Question[] | null;
  message: string;
};

const initialState: FormState = {
  status: "idle",
  data: null,
  message: "",
};

function getCorrectAnswerIndex(letter: string): number {
    if (!letter) return -1;
    const upperLetter = letter.toUpperCase();
    if (upperLetter === 'A') return 0;
    if (upperLetter === 'B') return 1;
    if (upperLetter === 'C') return 2;
    if (upperLetter === 'D') return 3;
    return -1;
}

export function UploadQuestionsClientPage() {
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const firestore = useFirestore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setState({ status: 'idle', data: null, message: '' });

    const formData = new FormData(event.currentTarget);
    const file = formData.get("csvFile") as File;
    const category = formData.get("category") as string;
    const examName = formData.get("examName") as string;
    const subject = formData.get("subject") as string;
    const previousYear = formData.get("previousYear") as string;
    const sourceExamName = formData.get("sourceExamName") as string;

    if (!file || file.size === 0) {
      setState({ status: "error", data: null, message: "No file selected." });
      setIsPending(false);
      return;
    }

    if (file.type !== "text/csv") {
        setState({ status: "error", data: null, message: "Invalid file type. Please upload a CSV." });
        setIsPending(false);
        return;
    }

    const csvText = await file.text();

    try {
        const result = Papa.parse<any>(csvText, { header: true, skipEmptyLines: true });

        if (result.errors.length > 0) {
            console.error("CSV Parsing errors:", result.errors);
            throw new Error(`Error parsing CSV: ${result.errors[0].message}`);
        }

        const requiredHeaders = ["Question", "OptionA", "OptionB", "OptionC", "OptionD", "CorrectAnswer", "Explanation", "Topic", "Difficulty"];
        const actualHeaders = result.meta.fields || [];
        // Check for required headers, but don't fail if optional ones are missing.
        const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));
        if (missingHeaders.length > 0) {
            throw new Error(`CSV is missing required headers: ${missingHeaders.join(", ")}`);
        }

        const questions: Question[] = result.data.map((row, index) => {
            const difficulty = row.Difficulty?.toLowerCase();
            if (!['easy', 'medium', 'hard'].includes(difficulty)) {
                throw new Error(`Invalid difficulty value at row ${index + 2}: ${row.Difficulty}`);
            }

            const correctAnswerIndex = getCorrectAnswerIndex(row.CorrectAnswer);
            if (correctAnswerIndex === -1) {
                throw new Error(`Invalid CorrectAnswer value at row ${index + 2}: ${row.CorrectAnswer}. Must be A, B, C, or D.`);
            }

            const questionId = `csv-${Date.now()}-${index}`;

            return {
                id: questionId,
                questionText: row.Question,
                options: [row.OptionA, row.OptionB, row.OptionC, row.OptionD].filter(Boolean),
                correctAnswerIndex: correctAnswerIndex,
                explanation: row.Explanation,
                category: row.Category || category || "General",
                examName: row.ExamName || examName || "General",
                subject: row.Subject || subject || "General",
                topic: row.Topic,
                subTopic: row.SubTopic || null,
                difficulty: difficulty,
                questionType: 'single_choice',
                previousYear: row.PreviousYear || previousYear || null,
                sourceExamName: row.SourceExamName || sourceExamName || null,
            };
        });

        const batch = writeBatch(firestore);
        const questionsRef = collection(firestore, "questions");
        
        questions.forEach((question) => {
          const docRef = doc(questionsRef, question.id);
          batch.set(docRef, question);
        });

        await batch.commit();

        setState({
            status: "success",
            data: questions,
            message: `Successfully saved ${questions.length} questions to Firestore.`,
        });

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during parsing or saving.";
        setState({
            status: "error",
            data: null,
            message: `Failed to process CSV: ${errorMessage}`,
        });
    } finally {
        setIsPending(false);
    }
  }


  return (
    <div className="grid gap-6">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Upload CSV</CardTitle>
            <CardDescription>
              Select a CSV file with questions to upload. Required headers: Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Explanation, Topic, Difficulty. Optional headers: Category, ExamName, Subject, SubTopic, PreviousYear, SourceExamName.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category (Fallback)</Label>
                <Select name="category">
                    <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="examName">Exam Name (Fallback)</Label>
                <Select name="examName">
                    <SelectTrigger>
                        <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="jee-main">JEE Main</SelectItem>
                        <SelectItem value="neet">NEET</SelectItem>
                        <SelectItem value="gate">GATE</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Fallback)</Label>
                <Select name="subject">
                    <SelectTrigger>
                        <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="maths">Maths</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
             <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="previousYear">Previous Year (Optional Fallback)</Label>
                    <Input id="previousYear" name="previousYear" placeholder="e.g., 2023" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="sourceExamName">Source Exam Name (Optional Fallback)</Label>

                    <Input id="sourceExamName" name="sourceExamName" placeholder="e.g., JEE Advanced" />
                </div>
             </div>
            <div className="space-y-2">
              <Label htmlFor="csvFile">CSV File</Label>
              <Input
                id="csvFile"
                name="csvFile"
                type="file"
                accept=".csv"
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Save to Firestore
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {state.status !== 'idle' && (
        <Card>
            <CardHeader>
                <CardTitle>Upload Result</CardTitle>
            </CardHeader>
            <CardContent>
                {state.status === "error" && (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                )}
                {state.status === "success" && state.data && (
                <div>
                     <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                    <div className="mt-4 border rounded-lg max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.data.map((q, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium max-w-sm truncate">{q.questionText}</TableCell>
                                        <TableCell>{q.topic}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{q.difficulty}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                )}
            </CardContent>
        </Card>
      )}

    </div>
  );
}
