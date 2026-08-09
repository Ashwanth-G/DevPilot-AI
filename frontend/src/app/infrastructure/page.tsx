import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { InfrastructureView } from "@/components/infrastructure/infrastructure-view";

export const metadata: Metadata = {
  title: "Infrastructure",
  description: "Kubernetes pods, Docker containers, and AWS resources overview.",
};

export default function InfrastructurePage() {
  return (
    <AppShell>
      <InfrastructureView />
    </AppShell>
  );
}
