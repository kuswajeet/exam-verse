
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/index'; 
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  BarChart, 
  LogOut, 
  Settings,
  Users,
  FileText,
  PlusCircle,
  BrainCircuit,
  UploadCloud,
  Library,
  Zap,
  Sparkles
} from 'lucide-react';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
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
      ]
    }
  ];

  return (
    <div className="hidden h-full min-h-screen w-72 flex-col border-r bg-card md:flex">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg">Verse Exam Prep</span>
        </Link>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col gap-6 px-4">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Settings Section (Separate) */}
          <div className="mt-2 pt-2 border-t">
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                pathname === "/dashboard/settings" && "bg-secondary text-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="border-t p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive" 
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </Button>
      </div>
    </div>
  );
}
