'use client';

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
// FIXED: No curly braces for default import
import AuthWrapper from "@/components/auth-wrapper"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}