import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-slate-800">
            Product Idea Generator
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 text-sm"
            >
              Feed
            </Link>
            <Link
              href="/subscriptions"
              className="text-slate-600 hover:text-slate-900 text-sm"
            >
              Subscriptions
            </Link>
            <span className="text-sm text-slate-500">{user.email}</span>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
