import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your DevPilot AI user profile, API tokens, and account settings.",
};

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileView />
    </AppShell>
  );
}
