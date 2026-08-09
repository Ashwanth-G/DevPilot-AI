"use client";

import { motion } from "framer-motion";
import { GitBranch, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const REPOS = [
  { name: "DevPilot-AI", visibility: "private", branch: "main", stars: 14, language: "TypeScript" },
  { name: "api-gateway", visibility: "private", branch: "main", stars: 8, language: "Go" },
  { name: "ml-pipeline", visibility: "internal", branch: "main", stars: 22, language: "Python" },
];

export function RepositoriesView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Connected Repositories</h1>
        <p className="text-muted-foreground text-sm mt-1">
          GitHub &amp; GitLab repositories connected to DevPilot MCP agents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REPOS.map((repo) => (
          <motion.div
            key={repo.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-5 border border-border/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">{repo.name}</span>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase">
                {repo.visibility}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Default branch: {repo.branch}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground/80 pt-2 border-t border-border/30">
              <span>{repo.language}</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {repo.stars}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
