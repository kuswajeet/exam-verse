import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockTests } from "@/lib/placeholder-data";

export default function TestsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Tests</CardTitle>
        <CardDescription>
          Choose a test to start preparing. Good luck!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell className="font-medium">{test.title}</TableCell>
                <TableCell>{test.subject}</TableCell>
                <TableCell>{test.questions.length}</TableCell>
                <TableCell>{test.durationMinutes} min</TableCell>
                <TableCell>
                  {test.isFree ? (
                    <Badge variant="outline">Free</Badge>
                  ) : (
                    `$${test.price.toFixed(2)}`
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild>
                    <Link href={`/dashboard/tests/${test.id}`}>Start Test</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
