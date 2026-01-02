'use client';

import { useEffect, useState } from 'react';
// REMOVED: import { useAuthState } from 'react-firebase-hooks/auth'; 
import { onAuthStateChanged, User } from 'firebase/auth'; // NEW: Standard import
import { auth, db } from '@/firebase/client'; 
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
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
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Loader2 } from "lucide-react";

export default function Dashboard() {
  // NEW: Manual Auth State Management (No external library needed)
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [results, setResults] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
  });

  // 1. Listen for Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Data when User is confirmed
  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to finish loading
      if (loadingAuth) return;
      if (!user) {
        setLoadingData(false); 
        return;
      }

      try {
        const q = query(
          collection(db, 'results'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResults(data);

        if (data.length > 0) {
          const total = data.length;
          const totalScore = data.reduce((acc: number, curr: any) => {
            const percentage = (curr.score / curr.totalQuestions) * 100;
            return acc + percentage;
          }, 0);
          const maxScore = Math.max(...data.map((r: any) => (r.score / r.totalQuestions) * 100));

          setStats({
            totalTests: total,
            averageScore: totalScore / total,
            bestScore: maxScore
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user, loadingAuth]);

  const chartData = results.slice(0, 5).reverse().map((r: any) => ({
    name: r.testTitle ? r.testTitle.substring(0, 10) + "..." : "Test",
    score: Math.round((r.score / r.totalQuestions) * 100)
  }));

  if (loadingAuth || loadingData) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold font-headline">Welcome back, {user?.displayName || "Student"}!</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">Lifetime attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.bestScore.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Personal record</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Keep learning!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your scores from the last 5 tests.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #ccc", borderRadius: "8px" }} cursor={{fill: "#f3f4f6"}} />
                  <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-400">No test data available yet.</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center">
             <div className="grid gap-2">
                <CardTitle>Recent Test Results</CardTitle>
                <CardDescription>An overview of your most recent attempts.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/results">View All <ArrowUpRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.slice(0, 5).map((attempt) => {
                   const percentage = (attempt.score / attempt.totalQuestions) * 100;
                   return (
                    <TableRow key={attempt.id}>
                      <TableCell><div className="font-medium truncate max-w-[120px]" title={attempt.testTitle}>{attempt.testTitle}</div></TableCell>
                      <TableCell className="text-right"><Badge variant={percentage >= 80 ? "default" : "secondary"}>{percentage.toFixed(0)}%</Badge></TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{attempt.createdAt?.seconds ? new Date(attempt.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}</TableCell>
                    </TableRow>
                   );
                })}
                {results.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No results yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}