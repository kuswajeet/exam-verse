
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase/provider';
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  BarChart, 
  Trophy, 
  Settings,
  Users,
  FileText,
  PlusCircle,
  Sparkles,
  UploadCloud,
  Library,
  Zap,
  Package2,
  BrainCircuit,
  LogOut,
  Star,
} from 'lucide-react';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useFirebase();
  const firebaseUser = auth.currentUser ?? user;
  const displayName =
    firebaseUser?.displayName?.trim() ||
    firebaseUser?.email?.split('@')[0] ||
    'Exam Verse Member';

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out?")) {
      return;
    }
    localStorage.removeItem("isPro");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out via Firebase:", error);
    }
    router.push("/");
  };

  const menuGroups = [
    {
      label: "Main",
      items: [
        { name: 'Tests', href: '/dashboard/tests', icon: BookOpen },
        { name: 'My Results', href: '/dashboard/results', icon: BarChart },
        { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
        { name: 'Analytics', href: '/dashboard/analytics', icon: BrainCircuit },
        { name: 'Study Materials', href: '/dashboard/materials', icon: Library },
      ]
    },
    {
      label: "Practice",
      items: [
        { name: 'One Liners', href: '/dashboard/practice/oneliners', icon: Zap },
        { name: 'Quizzes', href: '/dashboard/practice/quizzes', icon: FileText },
      ]
    },
    {
      label: "Admin Console", 
      items: [
        { name: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
        { name: 'Manage Questions', href: '/admin/questions', icon: FileText },
        { name: 'Create Test (Select)', href: '/admin/create-test', icon: PlusCircle },
        { name: 'Create Test (Manual)', href: '/dashboard/admin/create', icon: PlusCircle },
        { name: 'AI Generator', href: '/admin/generate-question', icon: Sparkles },
        { name: 'Bulk Upload', href: '/admin/upload-questions', icon: UploadCloud },
        { name: 'Manage Materials', href: '/admin/materials', icon: Library },
        { name: 'Debug', href: '/dashboard/debug', icon: '🐞' }
      ]
    }
  ];

  return (
    <div className="hidden md:block border-r bg-card">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6 text-primary" />
            <span className="">Exam Verse</span>
          </Link>
        </div>
        <div className="px-4 py-3 border-b text-sm">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Signed in as</p>
          <p className="font-semibold text-foreground truncate">{displayName}</p>
          {firebaseUser?.email && (
            <p className="text-xs text-muted-foreground truncate">{firebaseUser.email}</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
             {menuGroups.map((group) => (
                <div key={group.label} className="my-2">
                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.label}
                    </h3>
                    {group.items.map((item) => {
                       const Icon = item.icon;
                       const isActive = pathname === item.href;
                       return (
                         <Link
                           key={item.name}
                           href={item.href}
                           className={cn(
                             "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                             isActive && "bg-muted text-primary"
                           )}
                         >
                           {typeof Icon === 'string' ? <span>{Icon}</span> : <Icon className="h-4 w-4" />}
                           {item.name}
                         </Link>
                       );
                    })}
                </div>
             ))}
          </nav>
        </div>
         <div className="mt-auto p-4 border-t">
             <Link
              href="/dashboard/subscription"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                 pathname === "/dashboard/subscription" && "bg-muted text-primary"
              )}
            >
              <Star className="h-4 w-4" />
              Subscription
            </Link>
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                 pathname === "/dashboard/settings" && "bg-muted text-primary"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 px-3 py-2 text-destructive hover:text-destructive"
              onClick={handleLogout}
              >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
        </div>
      </div>
    </div>
  );
}
