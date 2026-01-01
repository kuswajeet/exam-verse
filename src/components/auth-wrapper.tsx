'use client';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getFirestore } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const db = getFirestore();
  const userDocRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<AppUser>(userDocRef);

  useEffect(() => {
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

    // If user data is still loading, don't do anything yet.
    if (isUserLoading) {
      return;
    }

    // If there's no user and they're not on an auth page, redirect to login.
    if (!user && !isAuthPage) {
      router.push('/login');
      return;
    }

    // If there IS a user and they are on an auth page, redirect to dashboard.
    if (user && isAuthPage) {
      router.push('/dashboard');
      return;
    }
    
    // If the user is logged in but we are still loading their profile,
    // we wait.
    if (user && isProfileLoading) {
        setIsCheckingRole(true);
        return;
    }

    // Once we have the user and their profile, we check roles.
    if (user && userProfile) {
        const isAdmin = userProfile.role === 'admin';
        const isAdminPage = pathname.startsWith('/admin');

        if (isAdminPage && !isAdmin) {
            // Non-admin trying to access admin pages
            router.push('/dashboard');
        } else {
            // User is either on a non-admin page, or is an admin on an admin page
            setIsCheckingRole(false);
        }
    } else if (user && !userProfile && !isProfileLoading) {
        // This case can happen briefly if the user doc hasn't been created yet
        // or if there's an issue fetching it. We'll treat them as a student for now.
        if (pathname.startsWith('/admin')) {
             router.push('/dashboard');
        } else {
            setIsCheckingRole(false);
        }
    } else {
      // For any other case (e.g., user is null on a non-protected page), stop checking.
      setIsCheckingRole(false);
    }

  }, [user, userProfile, isUserLoading, isProfileLoading, router, pathname]);

  if (isUserLoading || isCheckingRole) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 w-full max-w-md p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
