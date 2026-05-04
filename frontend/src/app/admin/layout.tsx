"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const sidebarItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/profile", label: "Profile", icon: "👤" },
  { href: "/admin/experiences", label: "Experiences", icon: "💼" },
  { href: "/admin/projects", label: "Projects", icon: "🚀" },
  { href: "/admin/blog", label: "Blog Posts", icon: "📝" },
  { href: "/admin/skills", label: "Skills", icon: "⚡" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "💬" },
  { href: "/admin/birthday", label: "Birthday", icon: "🎂" },
  { href: "/admin/messages", label: "Messages", icon: "📬" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Skip auth check on login page
  const isLoginPage = pathname === "/admin/login";

  const { data: user, isError } = useQuery({
    queryKey: ["auth-me"],
    queryFn: api.auth.me,
    retry: false,
    enabled: !isLoginPage,
  });

  useEffect(() => {
    if (isError && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [isError, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await api.auth.logout();
    toast.success("Logged out");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] transform transition-transform duration-200 lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(243,75%,59%)] to-[hsl(280,75%,60%)] flex items-center justify-center text-white font-bold text-sm">
              MK
            </div>
            <span className="font-semibold">Admin Panel</span>
          </Link>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-[hsl(var(--border))]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] w-full transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="h-14 border-b border-[hsl(var(--border))] flex items-center px-4 gap-4 bg-[hsl(var(--card))]">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded hover:bg-[hsl(var(--secondary))]">
            ☰
          </button>
          <div className="flex-1" />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">{user.email}</span>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
