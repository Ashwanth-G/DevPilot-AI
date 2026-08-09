import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { RepositoriesView } from "@/components/repositories/repositories-view";

export const metadata: Metadata = {
  title: "Repositories",
  description: "Browse connected GitHub repositories, branches, and CI/CD pipelines.",
};

export default function RepositoriesPage() {
  return (
    <AppShell>
      <RepositoriesView />
    </AppShell>
  );
}
