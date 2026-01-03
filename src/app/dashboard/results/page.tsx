'use client';

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { TestAttempt } from "@/lib/types";
import { Target, Star, BookOpen } from "lucide-react";

// Hardcoded past attempts to simulate history
const MOCK_PAST_ATTEMPTS: TestAttempt[] = [
    {
        id: 'mock-attempt-1',
        userId: 'mock-user-1',
        testId: 'test-hist',
        testTitle: 'History Special',
        answers: {},
        score: 3,
        totalQuestions: 5,
        accuracy: 60.0,
        // Using a proper Timestamp-like structure for consistency
        completedAt: { seconds: Math.floor(new Date('2024-05-10T10:00:00Z').getTime() / 1000), nanoseconds: 0 } as any,
    },
    {
        id: 'mock-attempt-2',
        userId: 'mock-user-1',
        testId: 'test-math',
        testTitle: 'Math Basics',
        answers: {},
        score: 5,
        totalQuestions: 5,
        accuracy: 100.0,
        completedAt: { seconds: Math.floor(new Date('2024-05-15T11:30:00Z').getTime() / 1000), nanoseconds: 0 } as any,
    }
];


export default function ResultsPage() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client-side
    setIsLoading(true);
    
    const latestResultString = localStorage.getItem('latestTestResult');
    let allAttempts = [...MOCK_PAST_ATTEMPTS];

    if (latestResultString) {
      try {
        const latestResult: TestAttempt = JSON.parse(latestResultString);
        // Ensure the loaded result has a consistent date format
        latestResult.completedAt = { seconds: Math.floor(new Date(latestResult.completedAt as any).getTime() / 1000), nanoseconds: 0 } as any;
        
        // Prevent duplicates if page is reloaded
        const existingIds = new Set(allAttempts.map(a => a.id));
        if (!existingIds.has(latestResult.id)) {
            allAttempts.push(latestResult);
        }

      } catch (error) {
        console.error("Failed to parse latest test result from localStorage", error);
      }
    }
    
    // Sort by completion date, newest first
    const sorted = allAttempts.sort((a, b) => (b.completedAt.seconds || 0) - (a.completedAt.seconds || 0));
    setAttempts(sorted);
    
    setIsLoading(false);
  }, []);

  const stats = useMemo(() => {
    if (!attempts || attempts.length === 0) {
      return { totalTests: 0, averageScore: 0, bestScore: 0 };
    }
    const totalTests = attempts.length;
    const totalAccuracy = attempts.reduce((acc, attempt) => acc + (attempt.accuracy || 0), 0);
    const averageScore = totalAccuracy / totalTests;
    const bestScore = Math.max(...attempts.map(attempt => attempt.accuracy || 0));

    return { totalTests, averageScore, bestScore };
  }, [attempts]);

  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">Total tests completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-24" /> : `${stats.averageScore.toFixed(1)}%`}</div>
            <p className="text-xs text-muted-foreground">Your overall average accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-24" /> : `${stats.bestScore.toFixed(1)}%`}</div>
            <p className="text-xs text-muted-foreground">Your highest accuracy on a test</p>
          </CardContent>
        </Card>
      </div>

        <Card>
        <CardHeader>
            <CardTitle>My Test History</CardTitle>
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
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                        </TableRow>
                ))) : attempts.length > 0 ? (
                attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                    <TableCell className="font-medium">{attempt.testTitle}</TableCell>
                    <TableCell>{attempt.score}/{attempt.totalQuestions}</TableCell>
                    <TableCell>
                        <Badge variant={(attempt.accuracy ?? 0) > 80 ? "default" : "secondary"}>
                        {(attempt.accuracy ?? 0).toFixed(0)}%
                        </Badge>
                    </TableCell>
                    <TableCell>{attempt.completedAt ? format(new Date(attempt.completedAt.seconds * 1000), "PP") : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="outline">
                        <Link href={`/dashboard/results/${attempt.id}`}>View Analysis</Link>
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            You haven't completed any tests yet. Go to the Tests tab to start!
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    </div>
  );
}

    