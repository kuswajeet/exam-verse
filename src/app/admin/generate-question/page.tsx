import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateQuestionClientPage } from "./client-page";

export default function GenerateQuestionPage() {
  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle className="text-2xl">AI Question Generator</CardTitle>
          <CardDescription>Use AI to generate a single test question based on a topic, exam, and difficulty.</CardDescription>
        </CardHeader>
      </Card>
      <GenerateQuestionClientPage />
    </div>
  );
}
