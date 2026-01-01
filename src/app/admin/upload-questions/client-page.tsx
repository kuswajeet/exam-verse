"use client";

import { useActionState } from "react";
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
import { CheckCircle, Loader, Terminal, Upload } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialState: FormState = {
  status: "idle",
  data: null,
  message: "",
};

export function UploadQuestionsClientPage() {
  const [state, formAction, isPending] = useActionState(uploadQuestionsAction, initialState);

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
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
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
                <Label htmlFor="examName">Exam Name</Label>
                <Select name="examName" required>
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
                <Label htmlFor="subject">Subject</Label>
                <Select name="subject" required>
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
             <div className="space-y-2">
              <Label htmlFor="subTopic">Sub-Topic (Optional)</Label>
              <Input id="subTopic" name="subTopic" placeholder="e.g., Kinematics" />
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
