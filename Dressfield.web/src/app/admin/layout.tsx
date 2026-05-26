import type { Metadata } from "next";
import { AdminAuthLayout } from "@/components/admin/admin-auth-layout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthLayout>{children}</AdminAuthLayout>;
}
