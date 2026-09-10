import type { Metadata } from "next";
import AdminGameServers from "@/components/Admin/AdminGameServers";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminGameServers />;
}
