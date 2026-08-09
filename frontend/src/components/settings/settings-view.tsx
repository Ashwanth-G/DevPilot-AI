"use client";

import { Cable, KeyRound } from "lucide-react";

export function SettingsView() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Integration and agent configuration will appear here as those capabilities are connected.
        </p>
      </div>

      <div className="glass space-y-6 rounded-xl border border-border/50 p-6">
        <div className="flex gap-3">
          <Cable className="mt-0.5 size-5 text-primary" />
          <div>
            <h3 className="font-semibold">No integrations connected</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              GitHub, Kubernetes, cloud, and model-provider setup will be enabled when their backend
              integrations are available.
            </p>
          </div>
        </div>
        <div className="flex gap-3 border-t border-border/40 pt-5">
          <KeyRound className="mt-0.5 size-5 text-primary" />
          <div>
            <h3 className="font-semibold">Secrets stay server-side</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tokens and infrastructure endpoints are never displayed in the browser or stored in this UI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
