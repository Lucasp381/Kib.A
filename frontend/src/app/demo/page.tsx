'use client'
import { useState } from "react";

export default function WorkerControl() {
  const [status, setStatus] = useState<null | boolean>(null);

  const refreshStatus = async () => {
    const res = await fetch("/api/worker/status");
    const json = await res.json();
    setStatus(json.running);
  };

  const start = async () => {
    await fetch("/api/worker/start", { method: "POST" });
    refreshStatus();
  };

  const stop = async () => {
    await fetch("/api/worker/stop", { method: "POST" });
    refreshStatus();
  };

  return (
    <div>
      <h3>Contrôle du Worker</h3>
      <p>Status : {status === null ? "?" : status ? "🟢 En marche" : "🔴 Arrêté"}</p>
      <button onClick={start}>Démarrer</button>
      <button onClick={stop}>Arrêter</button>
      <button onClick={refreshStatus}>Rafraîchir</button>
    </div>
  );
}
