"use client";

import { motion } from "framer-motion";
import { Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NODES = [
  { name: "node-prod-01", role: "Worker", status: "Ready", cpu: "42%", memory: "68%", pods: "18/25" },
  { name: "node-prod-02", role: "Worker", status: "Ready", cpu: "35%", memory: "54%", pods: "15/25" },
  { name: "node-prod-03", role: "Control Plane", status: "Ready", cpu: "21%", memory: "40%", pods: "12/25" },
];

export function InfrastructureView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Infrastructure Topology</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kubernetes clusters, nodes, containers, and cloud resources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {NODES.map((node) => (
          <motion.div
            key={node.name}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-5 border border-border/50 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-sm">{node.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{node.role}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                {node.status}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>CPU Load</span>
                <span className="font-mono text-foreground">{node.cpu}</span>
              </div>
              <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: node.cpu }} />
              </div>

              <div className="flex justify-between text-muted-foreground pt-1">
                <span>Memory</span>
                <span className="font-mono text-foreground">{node.memory}</span>
              </div>
              <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: node.memory }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
