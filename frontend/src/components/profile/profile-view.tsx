"use client";

import { Mail, Shield } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";

export function ProfileView() {
  const user = useAuthStore((state) => state.user);
  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "DP";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your authenticated DevPilot account.</p>
      </div>

      <div className="glass space-y-4 rounded-xl border border-border/50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-tr from-brand-500 to-blue-500 text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{user?.name ?? "Account"}</h3>
            <p className="text-sm capitalize text-muted-foreground">{user?.role ?? "member"}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-border/40 pt-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" /> Email address
            </span>
            <span className="truncate font-medium">{user?.email ?? "Unavailable"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Shield className="size-4" /> Role and permissions
            </span>
            <span className="capitalize font-medium">{user?.role ?? "member"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
