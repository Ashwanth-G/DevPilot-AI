import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to DevPilot AI — your AI-powered DevOps assistant.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4">
      {/* ── Background blobs ─────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full
                        bg-brand-500/10 blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full
                        bg-blue-500/10 blur-3xl animate-blob [animation-delay:2s]" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full
                        bg-purple-500/10 blur-3xl animate-blob [animation-delay:4s]" />
      </div>

      <div className="relative w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
