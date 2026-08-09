"use client";

import { motion } from "framer-motion";
import { Rocket, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DEPLOYMENTS = [
  {
    id: "DEP-401",
    service: "api-service",
    environment: "production",
    version: "v2.4.1",
    status: "successful",
    commit: "8a2f1b4 - feat: add Redis cluster support",
    author: "alex",
    time: "15m ago",
  },
  {
    id: "DEP-400",
    service: "frontend",
    environment: "production",
    version: "v1.12.0",
    status: "successful",
    commit: "3f9c0e2 - ui: polish dashboard cards",
    author: "sarah",
    time: "1h ago",
  },
  {
    id: "DEP-399",
    service: "worker-service",
    environment: "staging",
    version: "v0.9.4",
    status: "failed",
    commit: "1b4e5a9 - fix: queue batching logic",
    author: "devpilot-agent",
    time: "3h ago",
  },
];

export function DeploymentsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deployments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            CI/CD release history, pipeline status, and deployment triggers
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Rocket className="w-4 h-4" />
          Trigger Deployment
        </Button>
      </div>

      <div className="space-y-3">
        {DEPLOYMENTS.map((dep) => (
          <motion.div
            key={dep.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 flex items-center justify-between border border-border/50"
          >
            <div className="flex items-center gap-3">
              {dep.status === "successful" ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{dep.service}</span>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {dep.environment}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{dep.version}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{dep.commit}</p>
              </div>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              <span>{dep.time}</span>
              <p className="text-[10px] mt-0.5">by {dep.author}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
