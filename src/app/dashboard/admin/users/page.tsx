
'use client';

import { useState, useMemo } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/types";
import { format, subDays } from 'date-fns';
import { Trash2, Search, User as UserIcon, ShieldCheck } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

// --- MOCK DATA ---
type MockUser = User & { createdAt?: string; status: 'Free' | 'Pro' };

const INITIAL_MOCK_USERS: MockUser[] = [
    { uid: 'user_1', name: 'Satoshi N.', email: 'satoshi@example.com', role: 'student', createdAt: subDays(new Date(), 1).toISOString(), status: 'Pro' },
    { uid: 'user_2', name: 'Vitalik B.', email: 'vitalik@example.com', role: 'admin', createdAt: subDays(new Date(), 5).toISOString(), status: 'Pro' },
    { uid: 'user_3', name: 'Ada Lovelace', email: 'ada@example.com', role: 'student', createdAt: subDays(new Date(), 10).toISOString(), status: 'Free' },
    { uid: 'user_4', name: 'Grace Hopper', email: 'grace@example.com', role: 'student', createdAt: subDays(new Date(), 15).toISOString(), status: 'Free' },
    { uid: 'user_5', name: 'Alan Turing', email: 'alan@example.com', role: 'student', createdAt: subDays(new Date(), 20).toISOString(), status: 'Free' },
];


export default function ManageUsersPage() {
  const [users, setUsers] = useState<MockUser[]>(INITIAL_MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.uid !== userId));
    toast({ title: "User Deleted (Mock)", description: "The user has been removed from the list." });
  };
  
  const handleUpgradeUser = (userId: string) => {
    setUsers(users.map(u => u.uid === userId ? { ...u, status: 'Pro' } : u));
    alert("User upgraded to Pro Plan successfully!");
    toast({ 
        title: "Upgrade Successful", 
        description: "User has been upgraded to the Pro plan.",
        className: 'bg-green-100 dark:bg-green-900',
    });
  };

  const getJoinedDate = (user: MockUser) => {
    if (user.createdAt) {
      return format(new Date(user.createdAt), 'PP');
    }
    return 'N/A';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>
          A list of all users in the system.
        </CardDescription>
        <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search by name or email..." 
                className="pl-8 w-full md:w-1/3" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Pro' ? 'default' : 'outline'} className={user.status === 'Pro' ? 'bg-yellow-500 text-white' : ''}>
                      {user.status}
                    </Badge>
                  </TableCell>
                   <TableCell>{getJoinedDate(user)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'Free' && user.role !== 'admin' && (
                        <Button variant="outline" size="sm" onClick={() => handleUpgradeUser(user.uid)}>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Upgrade
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete User</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This is a mock action. This would permanently delete the user account for <span className="font-medium">{user.email}</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteUser(user.uid)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <UserIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        No users found matching your search.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
