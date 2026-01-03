'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { User as AppUser } from '@/lib/types';
import { useUser } from '@/firebase/provider';

export interface UseDataResult {
  profile: AppUser | null;
  isLoading: boolean;
  error: Error | null;
}

export function useData(): UseDataResult {
  const { user, isUserLoading } = useUser();
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let didCancel = false;

    if (!user) {
      setProfile(null);
      setError(null);
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(true);
    setError(null);

    getDoc(doc(db, 'users', user.uid))
      .then((snapshot) => {
        if (didCancel) return;
        if (snapshot.exists()) {
          setProfile({
            uid: snapshot.id,
            ...(snapshot.data() as AppUser),
          });
        } else {
          setProfile(null);
        }
      })
      .catch((fetchError) => {
        if (didCancel) return;
        setError(fetchError as Error);
      })
      .finally(() => {
        if (didCancel) return;
        setIsProfileLoading(false);
      });

    return () => {
      didCancel = true;
    };
  }, [user]);

  return {
    profile,
    isLoading: isUserLoading || isProfileLoading,
    error,
  };
}
