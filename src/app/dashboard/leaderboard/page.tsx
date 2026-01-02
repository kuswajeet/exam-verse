'use client';

import { useMemo } from 'react';
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
import { collectionGroup, query, orderBy, limit } from "firebase/firestore";
import type { TestAttempt } from "@/lib/types";
import { cn } from '@/lib/utils';

export default function LeaderboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Query the 'results' collection group across all users
  const leaderboardQuery = useMemoFirebase(
    () => (firestore 
        ? query(
            collectionGroup(firestore, 'results'), 
            orderBy('score', 'desc'),
            limit(20)
          ) 
        : null),
    [firestore]
  );
  
  const { data: attempts, isLoading } = useCollection<TestAttempt>(leaderboardQuery);

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
            <span role="img" aria-label="Trophy">🏆</span> Top Performers
        </CardTitle>
        <CardDescription>
          See how you stack up against the competition. This is the overall leaderboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Test</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Accuracy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                 Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                    </TableRow>
              ))) : attempts && attempts.length > 0 ? (
              attempts.map((attempt, index) => {
                const rank = index + 1;
                const isCurrentUser = user?.uid === attempt.userId;

                return (
                    <TableRow key={attempt.id} className={cn(isCurrentUser && "bg-primary/10")}>
                        <TableCell className="font-bold text-lg">{getMedal(rank)}</TableCell>
                        <TableCell className="font-medium">{attempt.studentName}</TableCell>
                        <TableCell>{attempt.testTitle}</TableCell>
                        <TableCell className="text-right">{attempt.score}/{attempt.totalQuestions}</TableCell>
                        <TableCell className="text-right">
                        <Badge variant={attempt.accuracy && attempt.accuracy > 80 ? 'default' : 'secondary'}>
                            {attempt.accuracy?.toFixed(0) ?? 'N/A'}%
                        </Badge>
                        </TableCell>
                    </TableRow>
                )
              })
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No results have been recorded yet. Be the first!
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
