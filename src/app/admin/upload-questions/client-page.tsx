"use client";

import { useFormState, useFormStatus } from "react-dom";
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
import { uploadQuestionsAction, FormState } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, FileUp, List, Loader, Terminal, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const initialState: FormState = {
  status: "idle",
  data: null,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </>
      ) : (
        <>
          <FileUp className="mr-2 h-4 w-4" />
          Upload and Parse CSV
        </>
      )}
    </Button>
  );
}

export function UploadQuestionsClientPage() {
  const [state, formAction] = useFormState(uploadQuestionsAction, initialState);

  return (
    <div className="grid gap-6">
      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Upload CSV</CardTitle>
            <CardDescription>
              Select a CSV file with questions to upload. The required headers are: Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Explanation, Topic, Difficulty.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <SubmitButton />
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
                    <div className="mt-4 border rounded-lg">
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
