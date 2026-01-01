import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadQuestionsClientPage } from "./client-page";

export default function UploadQuestionsPage() {
  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Bulk Question Upload</CardTitle>
          <CardDescription>Upload a CSV file to add multiple questions to the system at once.</CardDescription>
        </CardHeader>
      </Card>
      <UploadQuestionsClientPage />
    </div>
  );
}
