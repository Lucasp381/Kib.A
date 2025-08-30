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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

type WorkerStatus = {
  running: boolean;
  paused: boolean;
  pausedUntil: string | null;
};

export default function WorkerStatusMini() {
  const [status, setStatus] = useState<WorkerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState<number | null>(null); 

  async function fetchStatus(initialLoad = false) {
    try {
      if (initialLoad) setLoading(true);
      const res = await fetch("/api/backend/worker/status");
      const data = await res.json();
      setStatus(data);

      if (data.pausedUntil) {
        const ms = new Date(data.pausedUntil).getTime() - Date.now();
        setRemaining(Math.max(Math.ceil(ms / 1000), 0));
      } else {
        setRemaining(null);
      }
    } catch (err) {
      console.error("Erreur fetch status:", err);
    } finally {
      if (initialLoad) setLoading(false);
    }
  }

  async function action(endpoint: string, body?: object) {
    try {
      await fetch(`/api/backend/worker/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      await fetchStatus(true); 
    } catch (err) {
      console.error("Erreur action:", err);
    }
  }

useEffect(() => {
  fetchStatus(true);


  const interval = setInterval(() => {
    setRemaining((prev) => {
      if (prev === null) return null;

      const next = Math.max(prev - 1, 0);


      if (next === 0) {
        fetchStatus(false);
      }

      return next;
    });
  }, 1000);

 
  const syncInterval = setInterval(() => fetchStatus(false), 5000);

  return () => {
    clearInterval(interval);
    clearInterval(syncInterval);
  };
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

  function formatRemaining(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h > 0 ? `${h}h` : "", m > 0 ? `${m}m` : "", `${s}s`]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="flex">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 cursor-pointer w-min-32 h-8 select-none"
        >
          <span className={`w-2 h-2 rounded-full ${color}`} />
          {status.pausedUntil && remaining !== null ? (
            <div className="items-start text-left">
              <span>{text}</span>
              <small className="text-xs text-muted-foreground ml-2">
                {formatRemaining(remaining)}
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
            <DropdownMenuItem key="custom"  onClick={(e) => {e.preventDefault();}} onPointerMove={(e) => {e.preventDefault();}} onPointerLeave={(e) => {e.preventDefault();}} onPointerOut={(e) => {e.preventDefault();}}>
              <Input
                type="number"
                min={1}
                placeholder="X minutes"
                className="p-1 m-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const minutes = parseInt((e.target as HTMLInputElement).value);
                    if (!isNaN(minutes)) {
                      action("pause", { minutes });
                    }
                  }
                }}
              />

            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
