"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

/** Wrap authenticated application pages and redirect after session restoration. */
export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Restoring your session...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background bg-grid">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all duration-300",
          sidebarCollapsed ? "ml-0" : "ml-0"
        )}
      >
        <Topbar onMenuToggle={() => setSidebarCollapsed((value) => !value)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-[1600px] animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
