import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { AlertsView } from "@/components/alerts/alerts-view";

export const metadata: Metadata = {
  title: "Alerts",
  description: "Active Prometheus alerts, firing conditions, and alert history.",
};

export default function AlertsPage() {
  return (
    <AppShell>
      <AlertsView />
    </AppShell>
  );
}
