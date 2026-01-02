'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useDoc, useMemoFirebase, useFirestore } from "@/firebase/provider";
import { doc, updateDoc } from "firebase/firestore";
import type { User as AppUser } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<AppUser>(userDocRef);

  const getInitials = (name?: string) => {
    if (!name) return "";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }
  
  const makeAdmin = async () => {
    if (!userDocRef) return;
    try {
        await updateDoc(userDocRef, { role: 'admin' });
        toast({
            title: "Success!",
            description: "You are now an admin. You may need to refresh the page.",
            className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        });
    } catch (error) {
        console.error("Error updating role:", error);
        toast({
            title: "Error",
            description: "Could not update your role.",
            variant: "destructive"
        })
    }
  }

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Manage your account settings and profile information.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8">
           {isLoading ? (
             <Skeleton className="h-24 w-24 rounded-full" />
            ) : (
            <Avatar className="h-24 w-24">
                <AvatarImage src={user?.photoURL || ''} alt={userProfile?.name} />
                <AvatarFallback className="text-3xl">
                    {getInitials(userProfile?.name)}
                </AvatarFallback>
            </Avatar>
           )}
          <div className="flex-1 space-y-1 text-center md:text-left">
             {isLoading ? (
                <>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-64 mt-1" />
                </>
            ) : (
            <>
                <h2 className="text-2xl font-bold">{userProfile?.name}</h2>
                <p className="text-muted-foreground">{userProfile?.email}</p>
                <Badge>{userProfile?.role}</Badge>
            </>
            )}
          </div>
          <Button variant="outline" className="mt-4 md:mt-0">Upload Picture</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>View your current plan details.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div>
                    <p className="font-semibold">Current Plan</p>
                    <p className="text-2xl font-bold">Free</p>
                </div>
                <Button>Upgrade to Pro</Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>
            Change your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={userProfile?.name} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={userProfile?.email} disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled>Save Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password for better security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled>Change Password</Button>
        </CardFooter>
      </Card>
      
      {userProfile?.role !== 'admin' && (
        <Card>
            <CardHeader>
                <CardTitle>Developer Tools</CardTitle>
                <CardDescription>Actions for testing purposes.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={makeAdmin} variant="destructive">Developer: Make Me Admin</Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
