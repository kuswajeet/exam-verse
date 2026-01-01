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
import { mockTestAttempts } from "@/lib/placeholder-data";

export default function ResultsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Test Results</CardTitle>
        <CardDescription>
          Review your performance on past tests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Title</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Completed On</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTestAttempts.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell className="font-medium">{attempt.testTitle}</TableCell>
                <TableCell>{attempt.score}/{attempt.totalQuestions}</TableCell>
                <TableCell>
                  <Badge variant={attempt.score / attempt.totalQuestions > 0.8 ? "default" : "secondary"} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {((attempt.score / attempt.totalQuestions) * 100).toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell>{attempt.completedAt.toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/results/${attempt.id}`}>View Details</Link>
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
