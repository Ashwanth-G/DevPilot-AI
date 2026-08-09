"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back to DevPilot AI!");
      router.replace("/dashboard");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.detail : "Login failed. Please check your credentials.";
      toast.error("Authentication failed", { description: message });
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="glass-strong rounded-2xl border border-border/60 p-8 shadow-2xl"
    >
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-blue-500 glow-md">
          <Zap className="size-7 text-white" />
        </div>
        <h1 className="gradient-text text-2xl font-bold">DevPilot AI</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your DevOps command center</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button type="button" variant="outline" className="h-11 w-full" disabled>
          GitHub sign-in is coming soon
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or continue with email</span>
        <Separator className="flex-1" />
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={cn("pr-10", errors.password && "border-destructive focus-visible:ring-destructive")}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button type="submit" className="h-11 w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </motion.div>
      </form>

      <motion.p variants={itemVariants} className="mt-6 text-center text-xs text-muted-foreground">
        Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline">Create one</Link>
      </motion.p>
    </motion.div>
  );
}
