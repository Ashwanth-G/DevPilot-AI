import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a DevPilot AI account.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grid p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
