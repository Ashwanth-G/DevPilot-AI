"use client";

/**
 * Sidebar — primary navigation for DevPilot AI.
 * Supports collapsed/expanded state with smooth animations.
 * Uses Framer Motion for transitions.
 */

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  GitBranch,
  Rocket,
  Server,
  Activity,
  Bell,
  AlertTriangle,
  ScrollText,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Zap,
} from "lucide-react";

// ─── Navigation items definition ──────────────────────────────
const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard",      badge: null },
      { href: "/chat",           icon: MessageSquare,   label: "AI Chat",        badge: null },
    ],
  },
  {
    label: "DevOps",
    items: [
      { href: "/repositories",   icon: GitBranch,       label: "Repositories",   badge: null },
      { href: "/deployments",    icon: Rocket,          label: "Deployments",    badge: null },
      { href: "/infrastructure", icon: Server,          label: "Infrastructure", badge: null },
    ],
  },
  {
    label: "Observability",
    items: [
      { href: "/monitoring",     icon: Activity,        label: "Monitoring",     badge: null },
      { href: "/alerts",         icon: Bell,            label: "Alerts",         badge: null },
      { href: "/incidents",      icon: AlertTriangle,   label: "Incidents",      badge: null },
    ],
  },
  {
    label: "Security & Audit",
    items: [
      { href: "/audit",          icon: ScrollText,      label: "Audit Logs",     badge: null },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/settings",       icon: Settings,        label: "Settings",       badge: null },
      { href: "/profile",        icon: User,            label: "Profile",        badge: null },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-card/60 backdrop-blur-xl
                 border-r border-border/50 z-30 flex-shrink-0"
    >
      {/* ── Logo / Brand ────────────────────────────────── */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-blue-500
                        flex items-center justify-center flex-shrink-0 glow-sm">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="brand-text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="font-bold text-lg gradient-text whitespace-nowrap">
                DevPilot AI
              </span>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                AI DevOps Assistant
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.p
                  key={`label-${section.label}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest
                             text-muted-foreground/60"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>

            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "sidebar-item group relative",
                        isActive && "sidebar-item-active",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div
                          layoutId="active-sidebar-item"
                          className="absolute left-0 top-1/2 -translate-y-1/2
                                     w-0.5 h-6 rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}

                      <item.icon
                        className={cn(
                          "w-4.5 h-4.5 flex-shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />

                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.span
                            key={`label-${item.href}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.15 }}
                            className="flex-1 truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Badge */}
                      {item.badge !== null && !collapsed && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                      {item.badge !== null && collapsed && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer / AI status ──────────────────────────── */}
      <div className="p-3 border-t border-border/50">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="ai-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-lg p-3 mb-2"
            >
              <div className="flex items-center gap-2">
                <div className="pulse-dot relative">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
                </div>
                <span className="text-xs text-muted-foreground">
                  Integrations <span className="font-medium text-muted-foreground">Not connected</span>
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                <Cpu className="w-3 h-3" />
                <span>Connect providers in a later setup phase</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg",
            "text-muted-foreground hover:text-foreground hover:bg-accent",
            "transition-colors text-xs font-medium"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
