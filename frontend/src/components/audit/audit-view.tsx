"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AUDIT_LOGS = [
  {
    id: "AUD-8901",
    user: "alex@devpilot.ai",
    action: "Approved action: Restart deployment api-service",
    resource: "Kubernetes Cluster",
    ip: "192.168.1.104",
    time: "10m ago",
    status: "success",
  },
  {
    id: "AUD-8900",
    user: "DevPilot AI (Agent)",
    action: "Executed tool: docker_inspect",
    resource: "Container: worker-01",
    ip: "Internal SSE",
    time: "22m ago",
    status: "success",
  },
  {
    id: "AUD-8899",
    user: "sarah@devpilot.ai",
    action: "Updated environment variables for staging",
    resource: "GitHub Secrets",
    ip: "10.0.4.12",
    time: "1h ago",
    status: "success",
  },
];

export function AuditView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete, tamper-evident security audit trail of all AI and user actions
        </p>
      </div>

      <div className="glass rounded-xl overflow-hidden border border-border/50">
        <div className="divide-y divide-border/40">
          {AUDIT_LOGS.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    User: {log.user} · Target: {log.resource}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <Badge variant="outline" className="text-[11px]">
                  {log.id}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
