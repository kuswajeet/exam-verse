'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import type { TestAttempt } from '@/lib/types';
import { Target, Star, BookOpen } from 'lucide-react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUser } from '@/firebase/provider';

const normalizeTimestamp = (value: unknown): Timestamp | undefined => {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value;
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return value as Timestamp;
  }
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return undefined;
  return Timestamp.fromDate(date);
};

export default function ResultsPage() {
  const { user, isUserLoading } = useUser();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setAttempts([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAttempts = async () => {
      setIsLoading(true);
      try {
        const attemptsRef = collection(db, 'users', user.uid, 'results');
        const snapshot = await getDocs(attemptsRef);
        if (cancelled) return;
        const normalized = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              completedAt: normalizeTimestamp(data.completedAt) ?? undefined,
            } as TestAttempt;
          })
          .sort((a, b) => (b.completedAt?.seconds ?? 0) - (a.completedAt?.seconds ?? 0));
        setAttempts(normalized);
      } catch (error) {
        console.error('Failed to load test results', error);
        setAttempts([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAttempts();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const stats = useMemo(() => {
    if (!attempts || attempts.length === 0) {
      return { totalTests: 0, averageScore: 0, bestScore: 0 };
    }
    const totalTests = attempts.length;
    const totalAccuracy = attempts.reduce((acc, attempt) => acc + (attempt.accuracy ?? 0), 0);
    const averageScore = totalTests > 0 ? totalAccuracy / totalTests : 0;
    const bestScore = Math.max(...attempts.map((attempt) => attempt.accuracy ?? 0));

    return { totalTests, averageScore, bestScore };
  }, [attempts]);

  const tableLoading = isLoading || isUserLoading;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tableLoading ? <Skeleton className="h-8 w-12" /> : stats.totalTests}
            </div>
            <p className="text-xs text-muted-foreground">Total tests completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tableLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `${stats.averageScore.toFixed(1)}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Your overall average accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tableLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `${stats.bestScore.toFixed(1)}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Your highest accuracy on a test</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Test History</CardTitle>
          <CardDescription>Review your performance on past tests.</CardDescription>
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
              {tableLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : attempts.length > 0 ? (
                attempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-medium">{attempt.testTitle || 'Untitled Test'}</TableCell>
                    <TableCell>{`${attempt.score}/${attempt.totalQuestions}`}</TableCell>
                    <TableCell>
                      <Badge variant={(attempt.accuracy ?? 0) > 80 ? 'default' : 'secondary'}>
                        {(attempt.accuracy ?? 0).toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {attempt.completedAt
                        ? format(new Date(attempt.completedAt.seconds * 1000), 'PP')
                        : 'Pending'}
                    </TableCell>
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
                    No tests taken yet. Go to the 'Tests' page to start!
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
