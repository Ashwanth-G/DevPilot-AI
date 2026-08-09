import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { AuditView } from "@/components/audit/audit-view";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "Complete audit trail of all AI actions, tool executions, and user activity.",
};

export default function AuditPage() {
  return (
    <AppShell>
      <AuditView />
    </AppShell>
  );
}
