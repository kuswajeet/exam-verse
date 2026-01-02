
'use client';

import { useMemo, useState } from 'react';
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { TestAttempt } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const categories = ["engineering", "medical", "general", "physics", "chemistry", "maths", "biology"];

export default function LeaderboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const [filterType, setFilterType] = useState('all'); // 'all', 'exam', 'quiz'
  const [filterCategory, setFilterCategory] = useState('all');

  // 1. Fetch a broader set of top results from Firestore.
  const leaderboardQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Fetch top 20 scores overall to allow for client-side filtering.
    return query(collection(firestore, 'results'), orderBy('score', 'desc'), limit(20));
  }, [firestore]);
  
  const { data: allTopAttempts, isLoading } = useCollection<TestAttempt>(leaderboardQuery);

  // 2. Apply client-side filtering based on state.
  const filteredAndSortedAttempts = useMemo(() => {
    if (!allTopAttempts) return [];

    const filtered = allTopAttempts.filter(attempt => {
        const typeMatch = filterType === 'all' || attempt.testType === filterType;
        const categoryMatch = filterCategory === 'all' || attempt.category === filterCategory;
        return typeMatch && categoryMatch;
    });

    // The data is already sorted by score from Firestore, so we just need to take the top 10.
    return filtered.slice(0, 10);

  }, [allTopAttempts, filterType, filterCategory]);


  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };
  
  const getRowClass = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200/70 dark:hover:bg-blue-900/60";
    if (rank === 1) return "bg-amber-100 dark:bg-amber-900/40";
    if (rank === 2) return "bg-slate-100 dark:bg-slate-700/30";
    if (rank === 3) return "bg-orange-100 dark:bg-orange-900/40";
    return "";
  }

  const resetFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <span role="img" aria-label="Trophy">🏆</span> Hall of Fame
                </CardTitle>
                <CardDescription>
                See how you stack up against the competition. This is the top 10 leaderboard based on your filters.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="exam">Exams</SelectItem>
                        <SelectItem value="quiz">Quizzes</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={resetFilters}>Reset</Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardContent className="pt-6">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Test</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                            </TableRow>
                    ))) : filteredAndSortedAttempts && filteredAndSortedAttempts.length > 0 ? (
                    filteredAndSortedAttempts.map((attempt, index) => {
                        const rank = index + 1;
                        const isCurrentUser = user?.uid === attempt.userId;

                        return (
                            <TableRow key={attempt.id} className={getRowClass(rank, isCurrentUser)}>
                                <TableCell className="font-bold text-lg">{getMedal(rank)}</TableCell>
                                <TableCell className="font-medium">{attempt.studentName || 'Anonymous Student'}</TableCell>
                                <TableCell>{attempt.testTitle}</TableCell>
                                <TableCell className="capitalize">{attempt.category}</TableCell>
                                <TableCell className="capitalize">{attempt.testType}</TableCell>
                                <TableCell className="text-right font-semibold">{attempt.score}/{attempt.totalQuestions}</TableCell>
                            </TableRow>
                        )
                    })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                No champions found in this category yet. Be the first!
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
