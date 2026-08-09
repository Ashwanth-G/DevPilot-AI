import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { DeploymentsView } from "@/components/deployments/deployments-view";

export const metadata: Metadata = {
  title: "Deployments",
  description: "CI/CD pipeline status, deployment history, and GitHub Actions logs.",
};

export default function DeploymentsPage() {
  return (
    <AppShell>
      <DeploymentsView />
    </AppShell>
  );
}
