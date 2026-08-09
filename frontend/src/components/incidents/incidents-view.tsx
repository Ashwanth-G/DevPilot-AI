"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, Flame, Loader2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, incidentsApi, type Incident, type IncidentCreate } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";

const severityClass: Record<Incident["severity"], string> = {
  critical: "border-red-500/30 bg-red-500/10 text-red-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  low: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

const statusClass: Record<Incident["status"], string> = {
  open: "border-red-500/30 bg-red-500/10 text-red-400",
  investigating: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  resolved: "border-green-500/30 bg-green-500/10 text-green-400",
  closed: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

function IncidentListSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="glass rounded-xl border border-border/50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-72" />
              <Skeleton className="h-4 w-96 max-w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function IncidentsView() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IncidentCreate["severity"]>("medium");

  const incidentsQuery = useQuery({
    queryKey: ["incidents"],
    queryFn: () => incidentsApi.list(),
  });

  const createIncident = useMutation({
    mutationFn: incidentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setDialogOpen(false);
      setTitle("");
      setDescription("");
      setSeverity("medium");
      toast.success("Incident declared");
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.detail : "Unable to declare the incident.";
      toast.error("Incident was not created", { description: message });
    },
  });

  const submitIncident = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("A title is required to declare an incident.");
      return;
    }

    createIncident.mutate({
      title: trimmedTitle,
      description: description.trim() || undefined,
      severity,
    });
  };

  const errorMessage =
    incidentsQuery.error instanceof ApiError
      ? incidentsQuery.error.detail
      : "Unable to load incidents. Check that the DevPilot API is running and that you are signed in.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Incident Operations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track active incidents and preserve their investigation notes.
          </p>
        </div>
        <Button size="sm" variant="destructive" className="gap-2" onClick={() => setDialogOpen(true)}>
          <Flame className="size-4" />
          Declare incident
        </Button>
      </div>

      {incidentsQuery.isLoading ? (
        <IncidentListSkeleton />
      ) : incidentsQuery.isError ? (
        <div className="glass flex flex-col items-start gap-4 rounded-xl border border-destructive/30 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <h2 className="font-semibold">Incidents are unavailable</h2>
              <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => incidentsQuery.refetch()}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </div>
      ) : incidentsQuery.data?.length === 0 ? (
        <div className="glass rounded-xl border border-dashed border-border p-10 text-center">
          <Flame className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">No incidents yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Declared incidents will appear here with their severity, status, and investigation notes.
          </p>
          <Button className="mt-5 gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Declare the first incident
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {incidentsQuery.data?.map((incident, index) => (
            <motion.article
              key={incident.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="glass rounded-xl border border-border/50 p-5"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${severityClass[incident.severity]}`}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                    <h2 className="font-semibold text-base">{incident.title}</h2>
                  </div>
                  {incident.summary && (
                    <p className="mt-2 text-sm text-muted-foreground">{incident.summary}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      ID: <code className="font-mono">{incident.id}</code>
                    </span>
                    <span>Opened {formatRelativeTime(incident.createdAt)}</span>
                    {incident.resolvedAt && <span>Resolved {formatRelativeTime(incident.resolvedAt)}</span>}
                  </div>
                </div>
                <Badge variant="outline" className={`w-fit capitalize text-xs ${statusClass[incident.status]}`}>
                  {incident.status}
                </Badge>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Declare incident</DialogTitle>
            <DialogDescription>
              Create an incident record for the authenticated DevPilot workspace.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitIncident}>
            <div className="space-y-2">
              <Label htmlFor="incident-title">Title</Label>
              <Input
                id="incident-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What is affected?"
                autoFocus
                disabled={createIncident.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incident-severity">Severity</Label>
              <Select value={severity} onValueChange={(value) => setSeverity(value as IncidentCreate["severity"])}>
                <SelectTrigger id="incident-severity" className="w-full" disabled={createIncident.isPending}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="incident-description">Initial notes</Label>
              <Textarea
                id="incident-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add the observed impact, symptoms, or initial investigation details."
                rows={4}
                disabled={createIncident.isPending}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={createIncident.isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" className="gap-2" disabled={createIncident.isPending}>
                {createIncident.isPending ? <Loader2 className="size-4 animate-spin" /> : <Flame className="size-4" />}
                Declare incident
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
