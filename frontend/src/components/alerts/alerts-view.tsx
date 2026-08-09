"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Bell, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ALERTS_DATA = [
  {
    id: "ALT-101",
    name: "HighMemoryUsage",
    service: "Qdrant Vector DB",
    severity: "warning",
    summary: "Memory utilization exceeded threshold of 80% (Current: 84.2%)",
    status: "active",
    time: "12m ago",
  },
  {
    id: "ALT-102",
    name: "P99LatencySpike",
    service: "AI Engine",
    severity: "critical",
    summary: "P99 request latency spiked to 2.4s over 5 minute window",
    status: "active",
    time: "24m ago",
  },
  {
    id: "ALT-103",
    name: "CertExpiring",
    service: "Ingress Controller",
    severity: "info",
    summary: "TLS certificate for api.devpilot.ai expires in 14 days",
    status: "active",
    time: "2h ago",
  },
];

export function AlertsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alert Center</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time Prometheus alerts and system health notifications
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Bell className="w-4 h-4" />
          Silence Alerts
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ALERTS_DATA.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base">{alert.name}</span>
                    <Badge variant="outline" className="text-xs uppercase">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.summary}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/80">
                    <span>Service: <strong className="text-foreground">{alert.service}</strong></span>
                    <span>ID: <code className="font-mono">{alert.id}</code></span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {alert.time}</span>
                  </div>
                </div>
              </div>

              <Button size="sm" variant="outline" className="text-xs">
                Investigate
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
