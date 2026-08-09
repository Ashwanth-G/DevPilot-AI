import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure MCP server connections, API keys, notifications, and integrations.",
};

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsView />
    </AppShell>
  );
}
