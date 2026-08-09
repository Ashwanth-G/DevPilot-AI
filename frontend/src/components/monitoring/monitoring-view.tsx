"use client";

import { Activity, Radio } from "lucide-react";

export function MonitoringView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Metrics & Observability</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Integrated Grafana and Prometheus monitoring metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-base">Request Rate (RPS)</h3>
          </div>
          <p className="text-3xl font-bold font-mono">1,420 rps</p>
          <p className="text-xs text-muted-foreground mt-1">+12% compared to last hour</p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-base">Average Latency (P95)</h3>
          </div>
          <p className="text-3xl font-bold font-mono">42 ms</p>
          <p className="text-xs text-muted-foreground mt-1">Optimal performance range</p>
        </div>
      </div>
    </div>
  );
}
