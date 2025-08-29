"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";

type WorkerStatus = {
  running: boolean;
  paused: boolean;
  pausedUntil: string | null;
};

export default function WorkerStatusMini() {
  const [status, setStatus] = useState<WorkerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch status function
  async function fetchStatus(initialLoad = false) {
    try {
      if (initialLoad) setLoading(true);
      const res = await fetch("/api/backend/worker/status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Erreur fetch status:", err);
    } finally {
      if (initialLoad) setLoading(false);
    }
  }

  // Action function
  async function action(endpoint: string, body?: object) {
    try {
      await fetch(`/api/backend/worker/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      await fetchStatus(); // refresh status after action
    } catch (err) {
      console.error("Erreur action:", err);
    }
  }

  useEffect(() => {
    // premier chargement avec loader
    fetchStatus(true);
    // refresh toutes les 5s silencieux
    const interval = setInterval(() => fetchStatus(false), 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !status) {
    return (
      <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  const color = status.paused
    ? "bg-yellow-500"
    : status.running
    ? "bg-green-500"
    : "bg-red-500";

  const text = status.paused
    ? "Paused"
    : status.running
    ? "Running"
    : "Stopped";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="flex">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className={`w-2 h-2 rounded-full ${color}`} />
          {status.pausedUntil ? (
            <div className="items-start text-left">
              <span>{text}</span>
              <small className="text-xs text-muted-foreground ml-2">
                {(() => {
                  const ms = new Date(status.pausedUntil).getTime() - new Date().getTime();
                  if (ms <= 0) return "0s";
                  const totalSeconds = Math.ceil(ms / 1000);
                  const hours = Math.floor(totalSeconds / 3600);
                  const minutes = Math.floor((totalSeconds % 3600) / 60);
                  const seconds = totalSeconds % 60;
                  return [hours > 0 ? `${hours}h` : "", minutes > 0 ? `${minutes}m` : "", `${seconds}s`]
                    .filter(Boolean)
                    .join(" ");
                })()}
              </small>
            </div>
          ) : (
            <span>{text}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-30">
        {!status.running && (
          <DropdownMenuItem onClick={() => action("start")}>Start</DropdownMenuItem>
        )}
        {(status.running || status.paused) && (
          <DropdownMenuItem onClick={() => action("stop")}>Stop</DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Pause For...</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-30">
            {[1, 5, 10, 20, 30, 60].map((m) => (
              <DropdownMenuItem
                key={m}
                onClick={() => action("pause", { minutes: m })}
              >
                Pause {m < 60 ? `${m}m` : "1h"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
