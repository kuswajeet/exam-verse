
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Award } from "lucide-react";

// Hardcoded mock data for instant loading
const LEADERBOARD_DATA = [
  { rank: 1, name: 'Satoshi N.', points: 9850, testsTaken: 15, accuracy: 95, avatar: '/avatars/01.png' },
  { rank: 2, name: 'Vitalik B.', points: 9700, testsTaken: 18, accuracy: 92, avatar: '/avatars/02.png' },
  { rank: 3, name: 'Ada L.', points: 9650, testsTaken: 14, accuracy: 94, avatar: '/avatars/03.png' },
  { rank: 4, name: 'Grace H.', points: 9500, testsTaken: 20, accuracy: 88, avatar: '/avatars/04.png' },
  { rank: 5, name: 'Alan T.', points: 9450, testsTaken: 16, accuracy: 91, avatar: '/avatars/05.png' },
  { rank: 6, name: 'Margaret H.', points: 9300, testsTaken: 19, accuracy: 89, avatar: '/avatars/06.png' },
  { rank: 7, name: 'Linus T.', points: 9250, testsTaken: 22, accuracy: 85, avatar: '/avatars/07.png' },
  { rank: 8, name: 'John C.', points: 9100, testsTaken: 12, accuracy: 93, avatar: '/avatars/08.png' },
  { rank: 9, name: 'Tim B.', points: 9050, testsTaken: 25, accuracy: 84, avatar: '/avatars/09.png' },
  { rank: 10, name: 'Hedy L.', points: 9000, testsTaken: 17, accuracy: 88, avatar: '/avatars/10.png' },
];

const YOUR_RANK = { rank: 12, name: 'You', points: 8800, testsTaken: 11, accuracy: 82, avatar: '/avatars/user.png' };

const top3 = LEADERBOARD_DATA.slice(0, 3);
const runnersUp = LEADERBOARD_DATA.slice(3);

export default function LeaderboardPage() {

  const getPodiumCardClass = (rank: number) => {
    switch (rank) {
      case 1: return "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30";
      case 2: return "border-slate-400 bg-slate-50 dark:bg-slate-800/30";
      case 3: return "border-orange-400 bg-orange-50 dark:bg-orange-900/30";
      default: return "";
    }
  }
   const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2: return <Award className="h-8 w-8 text-slate-500" />;
      case 3: return <Award className="h-8 w-8 text-orange-500" />;
      default: return null;
    }
  }


  return (
    <div className="space-y-8 pb-24">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <span role="img" aria-label="Trophy">🏆</span> Hall of Fame
                </CardTitle>
                <CardDescription>
                Top performers across all exams.
                </CardDescription>
            </CardHeader>
        </Card>
      
        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {top3.map((player) => (
            <Card key={player.rank} className={`flex flex-col items-center p-6 ${getPodiumCardClass(player.rank)}`}>
                {getMedalIcon(player.rank)}
                <Avatar className="w-20 h-20 mt-4 border-2 border-white">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${player.name}`} alt={player.name} />
                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="mt-4 text-xl font-bold">{player.name}</h3>
                <p className="text-muted-foreground font-semibold">{player.points.toLocaleString()} XP</p>
                <p className="text-xs text-muted-foreground mt-2">{player.testsTaken} tests taken</p>
            </Card>
            ))}
        </div>

        {/* Ranks 4-10 Table */}
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
                    {runnersUp.map((player) => (
                    <TableRow key={player.rank}>
                        <TableCell className="font-bold text-lg">{player.rank}</TableCell>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${player.name}`} alt={player.name} />
                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{player.name}</span>
                        </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">{player.points.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{player.testsTaken}</TableCell>
                        <TableCell className="text-right">{player.accuracy}%</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
      
        {/* Fixed "Your Rank" Card */}
        <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-primary z-50">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <div className="flex-shrink-0 text-lg font-bold h-10 w-10 flex items-center justify-center bg-muted rounded-full">
                        {YOUR_RANK.rank}
                    </div>
                    <div>
                        <p className="font-bold">Your Rank</p>
                        <p className="text-sm text-muted-foreground">{YOUR_RANK.points.toLocaleString()} XP</p>
                    </div>
                </div>
                <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${YOUR_RANK.name}`} alt={YOUR_RANK.name} />
                    <AvatarFallback>Y</AvatarFallback>
                </Avatar>
            </CardContent>
        </Card>
    </div>
  );
}
