import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { IncidentsView } from "@/components/incidents/incidents-view";

export const metadata: Metadata = {
  title: "Incidents",
  description: "Incident history, root cause analyses, and resolution timelines.",
};

export default function IncidentsPage() {
  return (
    <AppShell>
      <IncidentsView />
    </AppShell>
  );
}
