"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, UserPlus, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(12, "Use at least 12 characters").max(72, "Use 72 characters or fewer"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { isAuthenticated, isLoading, register: registerAccount } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerAccount(data.email, data.password);
      toast.success("Your DevPilot account is ready.");
      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof ApiError ? error.detail : "Unable to create your account.";
      toast.error("Registration failed", { description: message });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl border border-border/60 p-8 shadow-2xl"
    >
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-blue-500 glow-md">
          <Zap className="size-7 text-white" />
        </div>
        <h1 className="gradient-text text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start using DevPilot AI with email and password.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="register-email">Email address</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            className={cn(errors.password && "border-destructive focus-visible:ring-destructive")}
            {...register("password")}
          />
          <p className="text-xs text-muted-foreground">Use 12–72 characters.</p>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="h-11 w-full gap-2" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          {isSubmitting ? "Creating account..." : "Create account"}
          {!isSubmitting && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}
