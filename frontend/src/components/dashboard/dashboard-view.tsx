"use client";

/**
 * DashboardView — Main operations overview page.
 *
 * Sections:
 * 1. KPI metrics (CPU, Memory, Pods, Deployments)
 * 2. System health overview (services grid)
 * 3. Latest deployments
 * 4. Active alerts
 * 5. CPU/Memory charts (Recharts)
 * 6. Recent AI actions
 */

import { motion } from "framer-motion";
import {
  Activity,
  Server,
  Rocket,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  Network,
  Box,
  GitBranch,
  Zap,
  Shield,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { Formatter } from "recharts/types/component/DefaultTooltipContent";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ─── Mock data (replaced by TanStack Query in production) ──────
const KPI_CARDS = [
  {
    id: "cpu-usage",
    label: "CPU Usage",
    value: "34%",
    delta: "-8%",
    trend: "down",
    icon: Cpu,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    id: "memory-usage",
    label: "Memory Usage",
    value: "62%",
    delta: "+5%",
    trend: "up",
    icon: HardDrive,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    id: "healthy-pods",
    label: "Healthy Pods",
    value: "48/50",
    delta: "96%",
    trend: "neutral",
    icon: Box,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    id: "deployments-today",
    label: "Deployments Today",
    value: "12",
    delta: "3 failed",
    trend: "warning",
    icon: Rocket,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

const SERVICES_HEALTH = [
  { name: "API Gateway",       status: "healthy",  latency: "23ms"  },
  { name: "Auth Service",      status: "healthy",  latency: "8ms"   },
  { name: "AI Engine",         status: "healthy",  latency: "1.2s"  },
  { name: "PostgreSQL",        status: "healthy",  latency: "4ms"   },
  { name: "Redis Cache",       status: "healthy",  latency: "1ms"   },
  { name: "Qdrant",            status: "warning",  latency: "120ms" },
  { name: "GitHub MCP",        status: "healthy",  latency: "340ms" },
  { name: "Docker MCP",        status: "healthy",  latency: "18ms"  },
  { name: "Kubernetes MCP",    status: "healthy",  latency: "56ms"  },
  { name: "Prometheus",        status: "healthy",  latency: "12ms"  },
  { name: "Grafana",           status: "healthy",  latency: "45ms"  },
  { name: "Celery Worker",     status: "healthy",  latency: "—"     },
];

const RECENT_DEPLOYMENTS = [
  {
    id: "d1",
    repo: "api-service",
    branch: "main",
    commit: "feat: add rate limiting",
    status: "success",
    env: "production",
    time: "2026-07-28T06:40:00Z",
    duration: 142,
  },
  {
    id: "d2",
    repo: "frontend",
    branch: "main",
    commit: "chore: bump dependencies",
    status: "success",
    env: "production",
    time: "2026-07-28T05:20:00Z",
    duration: 98,
  },
  {
    id: "d3",
    repo: "worker-service",
    branch: "fix/memory-leak",
    commit: "fix: memory leak in queue processor",
    status: "failed",
    env: "staging",
    time: "2026-07-28T04:15:00Z",
    duration: 67,
  },
  {
    id: "d4",
    repo: "ml-pipeline",
    branch: "main",
    commit: "feat: new embedding model",
    status: "running",
    env: "staging",
    time: "2026-07-28T07:00:00Z",
    duration: null,
  },
];

const ACTIVE_ALERTS = [
  {
    id: "a1",
    name: "HighMemoryUsage",
    severity: "warning",
    summary: "Qdrant memory usage above 80%",
    time: "2026-07-28T06:50:00Z",
  },
  {
    id: "a2",
    name: "SlowAPIResponse",
    severity: "warning",
    summary: "P99 latency > 2s on /api/v1/chat",
    time: "2026-07-28T06:45:00Z",
  },
  {
    id: "a3",
    name: "CertExpiringSoon",
    severity: "info",
    summary: "TLS certificate expires in 14 days",
    time: "2026-07-28T00:00:00Z",
  },
];

// Generate realistic CPU/memory time-series
const METRICS_DATA = Array.from({ length: 24 }, (_, hour) => ({
  time: `${String(hour).padStart(2, "0")}:00`,
  cpu: 28 + ((hour * 7) % 31) + (hour > 8 && hour < 18 ? 12 : 0),
  memory: 47 + ((hour * 5) % 22) + (hour > 6 && hour < 20 ? 9 : 0),
  network: 140 + ((hour * 73) % 720),
}));

const RECENT_AI_ACTIONS = [
  {
    id: "ai1",
    icon: Zap,
    color: "text-blue-400",
    action: "Investigated deployment failure in api-service",
    result: "Root cause: OOMKilled — memory limit too low",
    time: "2026-07-28T06:42:00Z",
  },
  {
    id: "ai2",
    icon: Shield,
    color: "text-green-400",
    action: "Security scan on 3 repositories",
    result: "No critical vulnerabilities found",
    time: "2026-07-28T05:30:00Z",
  },
  {
    id: "ai3",
    icon: Activity,
    color: "text-purple-400",
    action: "Performance analysis for production cluster",
    result: "Recommended increasing Qdrant memory limit to 4Gi",
    time: "2026-07-28T04:00:00Z",
  },
];

// ─── Animation variants ────────────────────────────────────────
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const percentTooltipFormatter: Formatter = (value, name) => [
  `${value?.toString() ?? ""}%`,
  name === "cpu" ? "CPU" : "Memory",
];

const networkTooltipFormatter: Formatter = (value) => [
  `${value?.toString() ?? ""} MB/s`,
  "Network",
];

// ─── Sub-components ────────────────────────────────────────────

function StatusIcon({ status }: { status: string }) {
  if (status === "healthy" || status === "success")
    return <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />;
  if (status === "failed" || status === "error" || status === "critical")
    return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
  if (status === "running" || status === "pending")
    return <Clock className="w-4 h-4 text-blue-400 flex-shrink-0 animate-spin" />;
  return <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
}

// ─── Main Component ────────────────────────────────────────────
export function DashboardView() {
  return (
    <div className="space-y-6">
      {/* ── Page header ───────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operations Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Preview of the DevPilot operations workspace
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Preview data
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {KPI_CARDS.map((card) => (
          <motion.div key={card.id} variants={item} id={card.id}>
            <div className="metric-card h-full">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", card.bg)}>
                  <card.icon className={cn("w-4 h-4", card.color)} />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium flex items-center gap-1",
                    card.trend === "down" && "text-green-400",
                    card.trend === "up" && "text-red-400",
                    card.trend === "warning" && "text-yellow-400",
                    card.trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {card.trend === "down" && <TrendingDown className="w-3 h-3" />}
                  {card.trend === "up" && <TrendingUp className="w-3 h-3" />}
                  {card.delta}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts Row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU + Memory Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-5"
          id="cpu-memory-chart"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            CPU &amp; Memory — 24h
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={METRICS_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(220,84%,58%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(220,84%,58%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(270,70%,60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(270,70%,60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} interval={5} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip
                formatter={percentTooltipFormatter}
                labelStyle={{ color: "hsl(210 40% 95%)" }}
                contentStyle={{ fontSize: 12 }}
              />
              <Area type="monotone" dataKey="cpu"    stroke="hsl(220,84%,58%)" fill="url(#cpuGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="memory" stroke="hsl(270,70%,60%)" fill="url(#memGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Network I/O Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-xl p-5"
          id="network-chart"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Network className="w-4 h-4 text-green-400" />
            Network Throughput — 24h
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={METRICS_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} interval={5} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} unit="MB" />
              <Tooltip
                formatter={networkTooltipFormatter}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="network" fill="hsl(142,76%,36%)" radius={[4, 4, 0, 0]} maxBarSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Services Health + Alerts ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Services health grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-xl p-5"
          id="services-health"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            Services Health
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SERVICES_HEALTH.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30
                           border border-border/30 hover:border-border/60 transition-colors"
              >
                <StatusIcon status={svc.status} />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{svc.name}</p>
                  <p className="text-[10px] text-muted-foreground">{svc.latency}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active alerts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-xl p-5"
          id="active-alerts-panel"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Active Alerts
            <span className="ml-auto nav-badge">{ACTIVE_ALERTS.length}</span>
          </h3>
          <div className="space-y-3">
            {ACTIVE_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border text-xs",
                  alert.severity === "warning" && "border-yellow-500/30 bg-yellow-500/5",
                  alert.severity === "critical" && "border-red-500/30 bg-red-500/5",
                  alert.severity === "info" && "border-blue-500/30 bg-blue-500/5"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold">{alert.name}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0 h-4",
                      alert.severity === "warning" && "text-yellow-400 border-yellow-400/30",
                      alert.severity === "critical" && "text-red-400 border-red-400/30",
                      alert.severity === "info" && "text-blue-400 border-blue-400/30"
                    )}
                  >
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{alert.summary}</p>
                <p className="text-muted-foreground/60 mt-1">
                  {formatRelativeTime(alert.time)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Deployments + AI Actions ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Deployments */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-5"
          id="recent-deployments"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-orange-400" />
            Recent Deployments
          </h3>
          <div className="space-y-3">
            {RECENT_DEPLOYMENTS.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30
                           border border-border/30 hover:border-border/60 transition-colors"
              >
                <StatusIcon status={dep.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{dep.repo}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                      {dep.env}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    <GitBranch className="w-3 h-3 inline mr-1" />
                    {dep.branch} · {dep.commit}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground">
                    {formatRelativeTime(dep.time)}
                  </p>
                  {dep.duration && (
                    <p className="text-[10px] text-muted-foreground/60">{dep.duration}s</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent AI Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-xl p-5"
          id="recent-ai-actions"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-400" />
            Recent AI Actions
          </h3>
          <div className="space-y-4">
            {RECENT_AI_ACTIONS.map((action) => (
              <div key={action.id} className="investigation-step">
                <div className="flex items-start gap-3">
                  <div className={cn("p-1.5 rounded-lg bg-muted/40 flex-shrink-0")}>
                    <action.icon className={cn("w-3.5 h-3.5", action.color)} />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{action.action}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{action.result}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatRelativeTime(action.time)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
