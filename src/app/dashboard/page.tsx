'use client';

import { useFirebase } from "@/firebase/provider";
import Link from "next/link";
import { BookOpen, BarChart, Trophy, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardRoot() {
  const { user } = useFirebase();
  // Get user name or fallback to "Student"
  const displayName = user?.displayName || user?.email?.split('@')[0] || "Student";

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {displayName}! Here is your daily overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/tests">
            <Button>Start New Test</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Quick Access Card 1: Tests */}
        <Link href="/dashboard/tests">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Practice Tests</CardTitle>
                <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">Start</div>
                <p className="text-xs text-muted-foreground">
                Access full mock exams
                </p>
            </CardContent>
            </Card>
        </Link>

        {/* Quick Access Card 2: Results */}
        <Link href="/dashboard/results">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Results</CardTitle>
                <BarChart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">View</div>
                <p className="text-xs text-muted-foreground">
                Check performance analysis
                </p>
            </CardContent>
            </Card>
        </Link>

        {/* Quick Access Card 3: One Liners */}
        <Link href="/dashboard/practice/oneliners">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Practice</CardTitle>
                <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">Revise</div>
                <p className="text-xs text-muted-foreground">
                One-liner questions
                </p>
            </CardContent>
            </Card>
        </Link>

        {/* Quick Access Card 4: Leaderboard */}
        <Link href="/dashboard/leaderboard">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
                <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">Rankings</div>
                <p className="text-xs text-muted-foreground">
                Compare with others
                </p>
            </CardContent>
            </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
                {/* Placeholder for no activity */}
                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                    No recent tests taken yet. Start practicing!
                </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
                <p>💡 Consistency is key. Try to take one test every day.</p>
                <p>💡 Analyze your wrong answers in the "Results" section.</p>
                <p>💡 Use "One Liners" for quick 5-minute revisions.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}