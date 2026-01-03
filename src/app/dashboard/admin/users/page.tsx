
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/types";
import { format, subDays } from 'date-fns';
import { Trash2, Search, User as UserIcon, ShieldCheck, MoreHorizontal, Edit, KeyRound, ArrowDown, ArrowUp } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

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
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);

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
  
  const handleTogglePlan = (userId: string) => {
    setUsers(users.map(u => u.uid === userId ? { ...u, status: u.status === 'Pro' ? 'Free' : 'Pro' } : u));
    toast({ 
        title: "Plan Changed", 
        description: "User subscription status has been updated.",
        className: 'bg-green-100 dark:bg-green-900',
    });
  };

  const handleOpenEditDialog = (user: MockUser) => {
    setEditingUser({ ...user });
  }

  const handleSaveEdit = () => {
    if (!editingUser) return;
    setUsers(users.map(u => u.uid === editingUser.uid ? editingUser : u));
    alert("User details updated!");
    setEditingUser(null);
  };
  
  const handleResetPassword = (email: string) => {
    alert(`Password reset link sent to ${email}`);
  };


  const getJoinedDate = (user: MockUser) => {
    if (user.createdAt) {
      return format(new Date(user.createdAt), 'PP');
    }
    return 'N/A';
  }

  return (
    <>
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
                        <DropdownMenuItem onClick={() => handleResetPassword(user.email)}>
                          <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                        </DropdownMenuItem>
                        {user.role !== 'admin' && (
                           <DropdownMenuItem onClick={() => handleTogglePlan(user.uid)}>
                              {user.status === 'Free' ? (
                                <><ArrowUp className="mr-2 h-4 w-4" /> Upgrade to Pro</>
                              ) : (
                                <><ArrowDown className="mr-2 h-4 w-4" /> Downgrade to Free</>
                              )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete User
                               </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user account for <span className="font-medium">{user.email}</span>. (Mock Action)
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.uid)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

    <Dialog open={!!editingUser} onOpenChange={(isOpen) => { if (!isOpen) setEditingUser(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
        </DialogHeader>
        {editingUser && (
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={editingUser.name || ''} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="col-span-3" />
                </div>
            </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
             <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveEdit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
