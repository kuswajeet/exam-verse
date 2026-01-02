
'use client';

import Link from "next/link";
import {
  Bell,
  Home,
  Package2,
  Users,
  LineChart,
  BookCopy,
  GraduationCap,
  FlaskConical,
  Upload,
  Settings,
  PlusCircle,
  Trophy,
} from "lucide-react";
import { usePathname } from 'next/navigation';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from "../icons";
import { useUser, useDoc, useMemoFirebase, useFirestore } from "@/firebase";
import type { User as AppUser } from "@/lib/types";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";


const navItems = [
  { href: "/dashboard", icon: Home, label: "Overview" },
  { href: "/dashboard/tests", icon: BookCopy, label: "Tests" },
  { href: "/dashboard/results", icon: GraduationCap, label: "Results" },
  { href: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/dashboard/analytics", icon: LineChart, label: "Analytics" },
  { href: "/dashboard/settings", icon: Settings, label: "My Profile" },
];

const adminNavItems = [
    { href: "/admin/manage-users", icon: Users, label: "Manage Users" },
    { href: "/admin/create-test", icon: PlusCircle, label: "Create Test" },
    { href: "/admin/generate-question", icon: FlaskConical, label: "AI Generator" },
    { href: "/admin/upload-questions", icon: Upload, label: "Bulk Upload" },
]

export function DashboardSidebar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc<AppUser>(userDocRef);
  
  const userRole = userProfile?.role; 

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <AppLogo className="h-6 w-6 text-primary" />
            <span className="font-headline">Verse Exam Prep</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted`,
                    isActive && 'bg-muted text-primary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )})}

            {/* Admin Section */}
            {userRole === 'admin' && (
                <>
                    <div className="my-2 mx-4 border-t" />
                     <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Admin</p>
                    {adminNavItems.map((item) => {
                       const isActive = pathname.startsWith(item.href);
                       return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                                isActive && 'bg-muted text-primary'
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    )})}
                </>
            )}

          </nav>
        </div>
        <div className="mt-auto p-4">
          <Card>
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>
                Unlock all features and get unlimited access to our support team.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" className="w-full">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
