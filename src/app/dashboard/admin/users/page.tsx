'use client';

import { useState, useMemo, useEffect } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { User } from '@/lib/types';
import { format } from 'date-fns';
import { Trash2, Search, User as UserIcon, MoreHorizontal, Edit, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, Timestamp, query, limit } from 'firebase/firestore';
import { db } from '@/firebase';

type AdminUser = User & { status: 'Free' | 'Pro'; createdAt?: string };

export default function ManageUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!editingUser) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [editingUser]);

  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersQuery = query(collection(db, 'users'), limit(20));
        const snapshot = await getDocs(usersQuery);
        if (cancelled) return;
        const normalized = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAtValue = data.createdAt;
          let createdAt: string | undefined;

          if (createdAtValue instanceof Timestamp) {
            createdAt = createdAtValue.toDate().toISOString();
          } else if (createdAtValue && typeof createdAtValue === 'object' && 'seconds' in createdAtValue) {
            createdAt = new Date((createdAtValue.seconds as number) * 1000).toISOString();
          } else if (createdAtValue) {
            createdAt = new Date(createdAtValue as string).toISOString();
          }

          return {
            uid: doc.id,
            name: data.name ?? '',
            email: data.email ?? '',
            role: (data.role as User['role']) ?? 'student',
            status: (data.status as 'Free' | 'Pro') ?? (data.isPro ? 'Pro' : 'Free'),
            createdAt,
          } as AdminUser;
        });
        setUsers(normalized);
      } catch (error) {
        console.error('Failed to load users', error);
        setUsers([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.uid !== userId));
    toast({ title: 'User Deleted (Mock)', description: 'The user has been removed from the list.' });
  };

  const handleTogglePlan = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.uid === userId ? { ...u, status: u.status === 'Pro' ? 'Free' : 'Pro' } : u
      )
    );
    toast({
      title: 'Plan Changed',
      description: 'User subscription status has been updated.',
      className: 'bg-green-100 dark:bg-green-900',
    });
  };

  const handleOpenEditDialog = (user: AdminUser) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    setUsers((prev) => prev.map((u) => (u.uid === editingUser.uid ? editingUser : u)));
    toast({ title: 'User Updated', description: `${editingUser.name}'s details have been saved.` });
    setEditingUser(null);
  };

  const handleResetPassword = (email: string) => {
    toast({ title: 'Password Reset', description: `A password reset link has been sent to ${email}. (Mock)` });
  };

  const getJoinedDate = (user: AdminUser) => {
    if (user.createdAt) {
      return format(new Date(user.createdAt), 'PP');
    }
    return 'N/A';
  };

  const showNoUsersMessage = !isLoading && users.length === 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
          <CardDescription>A list of all users in the system.</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-8 w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><span className="h-4 w-24 block bg-muted/40 animate-pulse"></span></TableCell>
                    <TableCell><span className="h-4 w-32 block bg-muted/40 animate-pulse"></span></TableCell>
                    <TableCell><span className="h-4 w-20 block bg-muted/40 animate-pulse"></span></TableCell>
                    <TableCell><span className="h-4 w-16 block bg-muted/40 animate-pulse"></span></TableCell>
                    <TableCell><span className="h-4 w-24 block bg-muted/40 animate-pulse"></span></TableCell>
                    <TableCell><span className="h-4 w-12 block bg-muted/40 animate-pulse float-right"></span></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length > 0 ? (
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
                      <Badge variant={user.status === 'Pro' ? 'default' : 'outline'} className={user.status === 'Pro' ? 'bg-amber-500 text-white' : ''}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getJoinedDate(user)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(user)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePlan(user.uid)}>
                            <KeyRound className="mr-2 h-4 w-4" /> Toggle Plan
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteUser(user.uid)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user.email)}>
                            <UserIcon className="mr-2 h-4 w-4" /> Reset Password
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    {showNoUsersMessage ? 'No users found in the database yet.' : 'No results match your search.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input placeholder="Full Name" value={editingUser?.name ?? ''} onChange={(e) =>
              setEditingUser((prev) => prev ? { ...prev, name: e.target.value } : prev)
            } />
            <Input placeholder="Email" value={editingUser?.email ?? ''} onChange={(e) =>
              setEditingUser((prev) => prev ? { ...prev, email: e.target.value } : prev)
            } />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
