
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTestClientPage } from "@/app/admin/create-test/client-page";

export default function CreateTestAdminPage() {
  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Test</CardTitle>
          <CardDescription>
            Configure the details of a new test. The questions will be automatically fetched based on the selected criteria.
          </CardDescription>
        </CardHeader>
      </Card>
      <CreateTestClientPage />
    </div>
  );
}
