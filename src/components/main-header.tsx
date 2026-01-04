
'use client';


import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/icons";
import { useUser } from "@/firebase";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export function MainHeader() {
  const { user, isUserLoading } = useUser();
  
  useEffect(() => {
    if (!isUserLoading && user) {
        redirect('/dashboard');
    }
  }, [user, isUserLoading]);


  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card border-b sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
        <AppLogo className="h-6 w-6 text-primary" />
        <span className="text-xl font-semibold">Exam Verse</span>
      </Link>
      <nav className="ml-auto flex gap-2 sm:gap-4">
        <Button asChild variant="ghost">
          <Link href="/login" prefetch={false}>
            Login
          </Link>
        </Button>
        <Button asChild>
          <Link href="/signup" prefetch={false}>
            Sign Up
          </Link>
        </Button>
      </nav>
    </header>
  );
}
