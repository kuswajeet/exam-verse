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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { generateQuestionAction, FormState } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrainCircuit, CheckCircle, Copy, Loader, Save, Terminal, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const initialState: FormState = {
  status: "idle",
  data: null,
  message: "",
};

export function GenerateQuestionClientPage() {
  const [state, formAction, isPending] = useActionState(generateQuestionAction, initialState);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied to clipboard!",
        description: "Question JSON copied successfully.",
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Question Parameters</CardTitle>
            <CardDescription>
              Fill in the details to generate a question.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g., Photosynthesis"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examName">Exam Name</Label>
              <Input
                id="examName"
                name="examName"
                placeholder="e.g., SAT Biology"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select name="difficulty" defaultValue="medium" required>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
              ) : "Generate Question"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <div className="space-y-4">
        {state.status === 'idle' && (
            <Card className="flex flex-col items-center justify-center h-full">
                <CardContent className="text-center p-6">
                    <BrainCircuit className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Generated question will appear here.</p>
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
        {state.status === "success" && state.data && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Question</CardTitle>
              <Badge variant="secondary" className="w-fit">Easy</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-semibold">{state.data.questionText}</p>
              <div className="space-y-2">
                {state.data.options.map((option, index) => (
                  <div key={index} className={`flex items-center gap-2 p-2 rounded-md border ${index === state.data!.correctAnswerIndex ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}>
                    {index === state.data!.correctAnswerIndex ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    <span>{option}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold mb-1">Explanation</h4>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{state.data.explanation}</p>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(state.data, null, 2))}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy JSON
                </Button>
                <Button size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save Question
                </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
