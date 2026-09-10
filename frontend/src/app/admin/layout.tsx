import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return false;

  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.user?.role === "admin";
  } catch {
    return false;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await isAdmin())) {
    notFound();
  }

  return <>{children}</>;
}
