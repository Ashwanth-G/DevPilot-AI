import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { MonitoringView } from "@/components/monitoring/monitoring-view";

export const metadata: Metadata = {
  title: "Monitoring",
  description: "Prometheus metrics, Grafana dashboards, and real-time system health.",
};

export default function MonitoringPage() {
  return (
    <AppShell>
      <MonitoringView />
    </AppShell>
  );
}
