"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/auth/login");
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
