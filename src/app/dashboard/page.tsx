'use client';

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
import { mockUser, mockTestAttempts } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const chartData = [
  { name: "Test 1", score: 80 },
  { name: "Test 2", score: 95 },
  { name: "Test 3", score: 72 },
  { name: "Test 4", score: 88 },
  { name: "Test 5", score: 91 },
];

export default function Dashboard() {
  const totalTests = mockTestAttempts.length;
  const averageScore =
    mockTestAttempts.reduce((acc, attempt) => acc + (attempt.score / attempt.totalQuestions) * 100, 0) / totalTests;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Welcome back, {mockUser.name}!</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">+2 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Studied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5h</div>
            <p className="text-xs text-muted-foreground">Focused and consistent!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Top 15%</div>
            <p className="text-xs text-muted-foreground">Keep up the great work</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Your scores from the last 5 tests.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                    contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                    cursor={{fill: "hsl(var(--muted))"}}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center">
             <div className="grid gap-2">
                <CardTitle>Recent Test Results</CardTitle>
                <CardDescription>
                  An overview of your most recent test attempts.
                </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/results">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
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
                {mockTestAttempts.slice(0, 5).map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      <div className="font-medium">{attempt.testTitle}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={attempt.score / attempt.totalQuestions > 0.8 ? "default" : "secondary"}>
                        {((attempt.score / attempt.totalQuestions) * 100).toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {attempt.completedAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
