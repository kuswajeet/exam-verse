
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTestManualClientPage } from "./client-page";

export default function CreateTestAdminPage() {
  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Test Manually</CardTitle>
          <CardDescription>
            Define test details and add questions from scratch. For creating tests from existing questions, use the main "Create Test" page.
          </CardDescription>
        </CardHeader>
      </Card>
      <CreateTestManualClientPage />
    </div>
  );
}
