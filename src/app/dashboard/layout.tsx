
'use client';

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import AuthWrapper from "@/components/auth-wrapper";

function LoadingSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
      <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <div className="flex flex-col">
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
            <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}
