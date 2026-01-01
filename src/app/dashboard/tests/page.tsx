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
import { mockTests } from "@/lib/placeholder-data";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import type { Test } from "@/lib/types";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function TestsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const testsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, "tests") : null),
    [firestore]
  );
  const { data: tests, isLoading: isLoadingTests } = useCollection<Test>(testsQuery);

  const testsToShow = tests || mockTests;

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
            {isLoadingTests ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : (
              testsToShow.map((test) => (
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
            )))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
