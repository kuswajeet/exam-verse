
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
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { TestAttempt } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { format } from "date-fns";
import { TrendingUp, Target, Star, BookOpen, Users, DollarSign, Activity } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useUser } from '@/firebase/provider';


// --- MOCK DATA SECTION FOR STUDENT ---
const MOCK_STUDENT_ATTEMPTS: TestAttempt[] = [
    { id: 'a1', testId: 't1', testTitle: 'Science Basics', score: 4, totalQuestions: 5, accuracy: 80, completedAt: { seconds: new Date('2024-07-01').getTime()/1000, nanoseconds: 0 } as Timestamp, userId: 'u1', category: 'Science', examName: 'Mock Exam', answers: {} },
    { id: 'a2', testId: 't2', testTitle: 'History Fundamentals', score: 6, totalQuestions: 10, accuracy: 60, completedAt: { seconds: new Date('2024-07-05').getTime()/1000, nanoseconds: 0 } as Timestamp, userId: 'u1', category: 'History', examName: 'Mock Exam', answers: {} },
    { id: 'a3', testId: 't3', testTitle: 'Algebra I', score: 9, totalQuestions: 10, accuracy: 90, completedAt: { seconds: new Date('2024-07-10').getTime()/1000, nanoseconds: 0 } as Timestamp, userId: 'u1', category: 'Math', examName: 'Mock Exam', answers: {} },
    { id: 'a4', testId: 't4', testTitle: 'Advanced Physics', score: 7, totalQuestions: 15, accuracy: 46.7, completedAt: { seconds: new Date('2024-07-15').getTime()/1000, nanoseconds: 0 } as Timestamp, userId: 'u1', category: 'Science', examName: 'Mock Exam', answers: {} },
    { id: 'a5', testId: 't5', testTitle: 'Biology Review', score: 14, totalQuestions: 15, accuracy: 93.3, completedAt: { seconds: new Date('2024-07-20').getTime()/1000, nanoseconds: 0 } as Timestamp, userId: 'u1', category: 'Science', examName: 'Mock Exam', answers: {} },
];

// --- MOCK DATA FOR ADMIN ---
const MOCK_ADMIN_DATA = {
    totalRevenue: 1250,
    activeProMembers: 15,
    totalSignups: 142,
    revenueGrowth: [
        { month: 'Jan', revenue: 200 },
        { month: 'Feb', revenue: 350 },
        { month: 'Mar', revenue: 400 },
        { month: 'Apr', revenue: 300 },
        { month: 'May', revenue: 500 },
        { month: 'Jun', revenue: 700 },
        { month: 'Jul', revenue: 1250 },
    ]
};

function StudentAnalyticsView() {
  const sortedAttempts = useMemo(() => {
    return [...MOCK_STUDENT_ATTEMPTS].sort((a, b) => {
      const timeA = a.completedAt?.seconds || 0;
      const timeB = b.completedAt?.seconds || 0;
      return timeA - timeB;
    });
  }, []);

  const stats = useMemo(() => {
    if (sortedAttempts.length === 0) return { totalTests: 0, averageScore: 0, bestScore: 0 };
    const totalAccuracy = sortedAttempts.reduce((acc, attempt) => acc + (attempt.accuracy || 0), 0);
    return {
      totalTests: sortedAttempts.length,
      averageScore: totalAccuracy / sortedAttempts.length,
      bestScore: Math.max(...sortedAttempts.map(attempt => attempt.accuracy || 0)),
    };
  }, [sortedAttempts]);

  const chartData = useMemo(() => {
    return sortedAttempts.map((attempt, index) => ({
      name: `Test ${index + 1}`,
      date: attempt.completedAt ? format(new Date(attempt.completedAt.seconds * 1000), "PP") : "N/A",
      testTitle: attempt.testTitle,
      accuracy: attempt.accuracy ? parseFloat(attempt.accuracy.toFixed(1)) : 0,
    }));
  }, [sortedAttempts]);
  
  if (sortedAttempts.length < 2) {
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
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis unit="%" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                formatter={(value: number) => [`${value}%`, `Accuracy`]}
                labelFormatter={(label, payload) => payload[0]?.payload.testTitle}
              />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}


function AdminAnalyticsView() {
    const { totalRevenue, activeProMembers, totalSignups, revenueGrowth } = MOCK_ADMIN_DATA;
    return (
        <div className="space-y-6">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{activeProMembers}</div>
                        <p className="text-xs text-muted-foreground">Pro members currently active</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalSignups}</div>
                        <p className="text-xs text-muted-foreground">All-time user registrations</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Growth</CardTitle>
                    <CardDescription>Mock revenue data for the current year.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={revenueGrowth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                             <Tooltip
                                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                                cursor={{fill: 'hsl(var(--muted))'}}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AnalyticsPage() {
    const { user, isUserLoading } = useUser();
    
    // Simulate admin role for demonstration purposes. 
    // In a real app, this would come from the user object from the database.
    const isAdmin = user?.email === 'vitalik@example.com'; 

    if (isUserLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                <Skeleton className="h-96" />
            </div>
        )
    }
    
    // Render the correct dashboard based on the user's role.
    return isAdmin ? <AdminAnalyticsView /> : <StudentAnalyticsView />;
}
