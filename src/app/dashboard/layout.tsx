'use client';

import { Sidebar } from "@/components/Sidebar";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AuthWrapper } from "@/components/auth-wrapper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <AuthWrapper>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <div className="flex flex-col">
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}