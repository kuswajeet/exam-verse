
'use client';

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import type { TestAttempt } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { format } from "date-fns";
import { TrendingUp, Target, Star, BookOpen } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const resultsQuery = useMemoFirebase(
    () => (user && firestore 
        ? query(
            collection(firestore, "results"), 
            where('userId', '==', user.uid)
          ) 
        : null),
    [user, firestore]
  );
  
  const { data: attempts, isLoading: isLoadingAttempts } = useCollection<TestAttempt>(resultsQuery);

  const sortedAttempts = useMemo(() => {
    if (!attempts) return [];
    return [...attempts].sort((a, b) => {
      const timeA = a.completedAt?.seconds || 0;
      const timeB = b.completedAt?.seconds || 0;
      return timeA - timeB; // Sort oldest to newest for chart progression
    });
  }, [attempts]);

  const stats = useMemo(() => {
    if (!sortedAttempts || sortedAttempts.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
      };
    }

    const totalTests = sortedAttempts.length;
    const totalAccuracy = sortedAttempts.reduce((acc, attempt) => acc + (attempt.accuracy || 0), 0);
    const averageScore = totalAccuracy / totalTests;
    const bestScore = Math.max(...sortedAttempts.map(attempt => attempt.accuracy || 0));

    return { totalTests, averageScore, bestScore };
  }, [sortedAttempts]);

  const chartData = useMemo(() => {
    return sortedAttempts.map((attempt, index) => ({
      name: `Test ${index + 1}`,
      date: format(new Date(attempt.completedAt.seconds * 1000), "PP"),
      testTitle: attempt.testTitle,
      accuracy: attempt.accuracy ? parseFloat(attempt.accuracy.toFixed(1)) : 0,
    }));
  }, [sortedAttempts]);

  if (isLoadingAttempts) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!attempts || attempts.length < 2) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Not Enough Data</h3>
            <p className="text-muted-foreground mt-2">
                Complete at least two tests to see your performance analytics.
            </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">Keep up the great work!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Your overall average accuracy.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Your highest accuracy on a test.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Your accuracy progression over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis unit="%" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{ 
                    background: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                }}
                formatter={(value: number, name: string, props) => [`${value}%`, `Accuracy`]}
                labelFormatter={(label, payload) => {
                    const data = payload[0]?.payload;
                    if(data) return `${data.testTitle} (${data.date})`;
                    return label;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                activeDot={{ r: 8, stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
