'use client';

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
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { TestAttempt } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ResultsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const resultsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, `users/${user.uid}/results`), orderBy('completedAt', 'desc')) : null),
    [user, firestore]
  );
  
  const { data: attempts, isLoading: isLoadingAttempts } = useCollection<TestAttempt>(resultsQuery);

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
            {isLoadingAttempts ? (
                 Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                    </TableRow>
              ))) : attempts && attempts.length > 0 ? (
              attempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium">{attempt.testTitle}</TableCell>
                  <TableCell>{attempt.score}/{attempt.totalQuestions}</TableCell>
                  <TableCell>
                    <Badge variant={attempt.score / attempt.totalQuestions > 0.8 ? "default" : "secondary"}>
                      {((attempt.score / attempt.totalQuestions) * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{attempt.completedAt ? format(new Date(attempt.completedAt.seconds * 1000), "PP") : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/results/${attempt.id}`}>View Details</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        You haven't completed any tests yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
