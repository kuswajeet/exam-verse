'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase';
import { useData } from '@/hooks/use-data';
import { useUser } from '@/firebase/provider';
import type { User as AppUser } from '@/lib/types';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Trophy, Award } from 'lucide-react';

type LeaderboardPlayer = {
  id: string;
  rank: number;
  name: string;
  xp: number;
  testsTaken: number;
  accuracy: number;
  avatarUrl?: string;
};

const getAvatarUrl = (player: { avatarUrl?: string; name: string }) =>
  player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}`;

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { profile } = useData();
  const { user } = useUser();

  useEffect(() => {
    let cancelled = false;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const leaderboardQuery = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
        const snapshot = await getDocs(leaderboardQuery);
        if (cancelled) return;
        const mapped = snapshot.docs.map((doc, index) => {
          const data = doc.data();
          const name = (data.name as string) || (data.email as string)?.split('@')[0] || 'Anonymous';
          return {
            id: doc.id,
            rank: index + 1,
            name,
            xp: Number(data.xp ?? 0),
            testsTaken: Number(data.testsTaken ?? data.completedTests ?? 0),
            accuracy: Number(data.accuracy ?? 0),
            avatarUrl: data.avatarUrl as string | undefined,
          };
        });
        setLeaders(mapped);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const top3 = leaders.slice(0, 3);
  const runnersUp = leaders.slice(3);
  const profileStats = profile as AppUser & Partial<LeaderboardPlayer> | null;
  const yourEntryIndex = leaders.findIndex((player) => player.id === user?.uid);
  const yourRank =
    yourEntryIndex >= 0
      ? leaders[yourEntryIndex]
      : profileStats
      ? {
          id: profileStats.uid,
          rank: -1,
          name: profileStats.name || 'You',
          xp: profileStats.xp ?? 0,
          testsTaken: profileStats.testsTaken ?? 0,
          accuracy: profileStats.accuracy ?? 0,
          avatarUrl: profileStats.avatarUrl,
        }
      : undefined;

  const getPodiumCardClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
      case 2:
        return 'border-slate-400 bg-slate-50 dark:bg-slate-800/30';
      case 3:
        return 'border-orange-400 bg-orange-50 dark:bg-orange-900/30';
      default:
        return '';
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Award className="h-8 w-8 text-slate-500" />;
      case 3:
        return <Award className="h-8 w-8 text-orange-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <span role="img" aria-label="Trophy">
              🏆
            </span>{' '}
            Hall of Fame
          </CardTitle>
          <CardDescription>Top performers across all exams.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {top3.map((player) => (
          <Card
            key={player.id}
            className={`flex flex-col items-center p-6 ${getPodiumCardClass(player.rank)}`}
          >
            {getMedalIcon(player.rank)}
            <Avatar className="w-20 h-20 mt-4 border-2 border-white">
              <AvatarImage
                src={getAvatarUrl({ name: player.name, avatarUrl: player.avatarUrl })}
                alt={player.name}
              />
              <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="mt-4 text-xl font-bold">{player.name}</h3>
            <p className="text-muted-foreground font-semibold">{player.xp.toLocaleString()} XP</p>
            <p className="text-xs text-muted-foreground mt-2">{player.testsTaken} tests taken</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>The best of the best.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">XP</TableHead>
                <TableHead className="text-right">Tests Taken</TableHead>
                <TableHead className="text-right">Avg. Accuracy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runnersUp.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Leaderboard data is loading or not available yet.
                  </TableCell>
                </TableRow>
              ) : (
                runnersUp.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-bold text-lg">{player.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={getAvatarUrl({ name: player.name, avatarUrl: player.avatarUrl })}
                            alt={player.name}
                          />
                          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{player.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{player.xp.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{player.testsTaken}</TableCell>
                    <TableCell className="text-right">{player.accuracy.toFixed(1)}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {yourRank && (
        <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-primary z-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 text-lg font-bold h-10 w-10 flex items-center justify-center bg-muted rounded-full">
                {yourRank.rank > 0 ? yourRank.rank : '—'}
              </div>
              <div>
                <p className="font-bold">Your Rank</p>
                <p className="text-sm text-muted-foreground">{yourRank.xp.toLocaleString()} XP</p>
              </div>
            </div>
            <Avatar>
              <AvatarImage
                src={getAvatarUrl({ name: yourRank.name, avatarUrl: yourRank.avatarUrl })}
                alt={yourRank.name}
              />
              <AvatarFallback>{yourRank.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
