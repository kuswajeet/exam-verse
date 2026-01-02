
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
import { CheckCircle, Loader, Terminal, Upload, Download } from "lucide-react";
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

function getCorrectAnswerIndex(row: any): number {
    const answer = row.CorrectAnswer?.trim();
    if (!answer) return -1;
    
    // Handle 'A', 'B', 'C', 'D'
    const letter = answer.toUpperCase();
    if (letter === 'A') return 0;
    if (letter === 'B') return 1;
    if (letter === 'C') return 2;
    if (letter === 'D') return 3;

    // Handle if the answer text is provided directly
    const options = [row.OptionA, row.OptionB, row.OptionC, row.OptionD].map(o => o?.trim());
    const index = options.indexOf(answer);
    if (index !== -1) return index;

    return -1;
}

export function UploadQuestionsClientPage() {
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const firestore = useFirestore();

  const handleDownloadTemplate = () => {
    const headers = "Question,Type,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation,Topic,Difficulty,SourceExamName,PreviousYear";
    const exampleMcq = "What is 2+2?,multiple_choice,1,3,4,5,4,Basic math fact,Math,easy,Basic Maths Test,2022";
    const exampleOneLiner = "What is the powerhouse of the cell?,one_liner,,,,,Mitochondria,Energy source,Biology,medium,NEET,2021";
    
    const csvContent = [headers, exampleMcq, exampleOneLiner].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "question_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) {
        setState({ status: 'error', data: null, message: "Database not connected." });
        return;
    }
    setIsPending(true);
    setState({ status: 'idle', data: null, message: '' });

    const formData = new FormData(event.currentTarget);
    const file = formData.get("csvFile") as File;
    const category = formData.get("category") as string;
    const examName = formData.get("examName") as string;
    const subject = formData.get("subject") as string;
    const sourceExamNameFallback = formData.get("sourceExamName") as string;
    const previousYearFallback = formData.get("previousYear") as string;

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

        const requiredHeaders = ["Question", "CorrectAnswer", "Explanation", "Topic", "Difficulty"];
        const actualHeaders = result.meta.fields || [];
        const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));
        if (missingHeaders.length > 0) {
            throw new Error(`CSV is missing required headers: ${missingHeaders.join(", ")}`);
        }
        
        let oneLinerCount = 0;
        let mcqCount = 0;

        const questions: Question[] = result.data.map((row, index) => {
            const rowNum = index + 2;
            const questionType = row.Type?.toLowerCase() === 'one_liner' ? 'one_liner' : 'single_choice';
            const difficulty = row.Difficulty?.toLowerCase();
            
            if (!['easy', 'medium', 'hard'].includes(difficulty)) {
                throw new Error(`Invalid difficulty value at row ${rowNum}: ${row.Difficulty}`);
            }
            
            const questionId = `csv-${Date.now()}-${index}`;
            let options: string[] = [];
            let correctAnswerIndex: number;

            if (questionType === 'one_liner') {
                oneLinerCount++;
                options = [row.CorrectAnswer];
                correctAnswerIndex = 0;
            } else {
                mcqCount++;
                options = [row.OptionA, row.OptionB, row.OptionC, row.OptionD].filter(Boolean);
                if (options.length !== 4) {
                    throw new Error(`Row ${rowNum} is 'multiple_choice' but does not have 4 options.`);
                }
                correctAnswerIndex = getCorrectAnswerIndex(row);
                 if (correctAnswerIndex === -1) {
                    throw new Error(`Invalid CorrectAnswer at row ${rowNum}: '${row.CorrectAnswer}'. Must be A, B, C, D or match an option text.`);
                }
            }

            return {
                id: questionId,
                questionText: row.Question,
                options: options,
                correctAnswerIndex: correctAnswerIndex,
                explanation: row.Explanation,
                category: row.Category || category || "General",
                examName: row.ExamName || examName || "General",
                subject: row.Subject || subject || "General",
                topic: row.Topic,
                subTopic: row.SubTopic || null,
                difficulty: difficulty,
                questionType: questionType,
                previousYear: row.PreviousYear || previousYearFallback || null,
                sourceExamName: row.SourceExamName || sourceExamNameFallback || null,
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
            message: `Successfully saved ${mcqCount} MCQs and ${oneLinerCount} One-Liners to Firestore.`,
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
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Upload CSV</CardTitle>
                <CardDescription>
                  Upload questions in bulk. Required headers: Question, Type, CorrectAnswer, Explanation, Topic, Difficulty. For 'multiple_choice' also include OptionA, OptionB, OptionC, OptionD.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="mr-2" /> Download Template
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Provide fallback values for category, exam, and subject if they are not specified in the CSV file.</p>
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

             <div className="grid md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="sourceExamName">Source Exam Name (Optional Fallback)</Label>
                    <Input id="sourceExamName" name="sourceExamName" placeholder="e.g. JEE Advanced" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="previousYear">Previous Year (Optional Fallback)</Label>
                    <Input id="previousYear" name="previousYear" placeholder="e.g. 2023" />
                </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label htmlFor="csvFile" className="font-bold">CSV File</Label>
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
                                    <TableHead>Type</TableHead>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.data.map((q, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium max-w-sm truncate">{q.questionText}</TableCell>
                                         <TableCell>
                                            <Badge variant={q.questionType === 'one_liner' ? 'outline' : 'secondary'}>{q.questionType}</Badge>
                                        </TableCell>
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
