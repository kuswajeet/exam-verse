'use client';

import Link from "next/link";
import {
  CircleUser,
  Menu,
  Search,
  Package2,
  BookOpen,
  BarChart,
  Trophy,
  BrainCircuit,
  Library,
  Zap,
  FileText,
  Users,
  Sparkles,
  UploadCloud,
  PlusCircle,
  Settings,
  LogOut
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/firebase/provider";
import { Skeleton } from "../ui/skeleton";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";

export function DashboardHeader() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const navLinks = [
      { name: 'Tests', href: '/dashboard/tests', icon: BookOpen },
      { name: 'My Results', href: '/dashboard/results', icon: BarChart },
      { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BrainCircuit },
      { name: 'Study Materials', href: '/dashboard/materials', icon: Library },
  ];

   const practiceLinks = [
      { name: 'One Liners', href: '/dashboard/practice/oneliners', icon: Zap },
      { name: 'Quizzes', href: '/dashboard/practice/quizzes', icon: FileText },
  ];

  const adminLinks = [
      { name: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
      { name: 'Manage Questions', href: '/admin/questions', icon: FileText },
      { name: 'Create Test (Select)', href: '/admin/create-test', icon: PlusCircle },
      { name: 'Create Test (Manual)', href: '/dashboard/admin/create', icon: PlusCircle },
      { name: 'AI Generator', href: '/admin/generate-question', icon: Sparkles },
      { name: 'Bulk Upload', href: '/admin/upload-questions', icon: UploadCloud },
      { name: 'Manage Materials', href: '/admin/materials', icon: Library },
      { name: 'Debug', href: '/dashboard/debug', icon: '🐞' }
  ];

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Verse Exam Prep</span>
            </Link>
             {navLinks.map(link => (
              <Link key={link.name} href={link.href} className="text-muted-foreground hover:text-foreground">
                {link.name}
              </Link>
            ))}
            <div className="my-2 border-t"></div>
            <h4 className="text-sm font-semibold text-muted-foreground">Practice</h4>
             {practiceLinks.map(link => (
              <Link key={link.name} href={link.href} className="text-muted-foreground hover:text-foreground">
                {link.name}
              </Link>
            ))}
            <div className="my-2 border-t"></div>
            <h4 className="text-sm font-semibold text-muted-foreground">Admin</h4>
             {adminLinks.map(link => (
              <Link key={link.name} href={link.href} className="text-muted-foreground hover:text-foreground">
                {link.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        {/* Can add a search here if needed */}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            {isUserLoading ? (
                <Skeleton className="h-8 w-8 rounded-full" />
            ) : user?.photoURL ? (
                <img src={user.photoURL} width={36} height={36} alt="User avatar" className="rounded-full" />
            ) : (
                <CircleUser className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
            <LogOut className="mr-2 h-4 w-4"/>
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
