"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { alertFieldMap } from "@/lib/alertFieldMap";
import { Badge } from "@/components/ui/badge";
import { ObservabilityAlert } from "@/types/alerts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useElasticKV } from "@/hooks/useElasticKV";

interface AlertsTableProps {
  pageSize?: number;
  refreshIntervalMs?: number; // intervalle refresh automatique
}

export default function AlertsTable({ pageSize = 15, refreshIntervalMs = 5000 }: AlertsTableProps) {
  const { get } = useElasticKV();
  const [KIBANA_URL, setKIBANA_URL] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<ObservabilityAlert[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const alertColumns: Array<keyof typeof alertFieldMap> = Object.keys(alertFieldMap) as Array<keyof typeof alertFieldMap>;

  // Fetch alerts
  const fetchAlerts = async (currentPage: number, initialLoad = false) => {
    try {
      // fetch KIBANA_URL seulement la première fois
      if (initialLoad && !KIBANA_URL) {
        const response = await get('KIBANA_URL');
        if (response.ok && response.value) setKIBANA_URL(response.value);
      }

      const res = await fetch(
        `/api/backend/elastic/index/documents?index=*alerts-*&limit=${pageSize}&page=${currentPage}&sort=@timestamp:desc&FieldMustExist=kibana.alert.rule.uuid`
      );
      const result = await res.json();
      setAlerts(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Erreur fetch alerts:", err);
    }
  };

  // Premier chargement et refresh automatique
  useEffect(() => {
    fetchAlerts(page, true); // initial load

    const interval = setInterval(() => fetchAlerts(page), refreshIntervalMs);
    return () => clearInterval(interval);
  }, [page]); // refait le fetch si la page change

  return (
    <div className="w-full">
      <ScrollArea className="overflow-y-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              {alertColumns.map((col) => (
                <TableHead key={col}>{alertFieldMap[col]}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert: ObservabilityAlert) => (
              <TableRow
                key={alert._id}
                onDoubleClick={() => {
                  const ruleUuid = alert._source?.["kibana.alert.rule.uuid"];
                  if (ruleUuid && KIBANA_URL) {
                    window.open(`${KIBANA_URL}/app/observability/alerts/rules/${ruleUuid}`, "_blank");
                  }
                }}
                className="cursor-pointer"
              >
                {alertColumns.map((col) => (
                  <TableCell key={col} className="overflow-hidden">
                    {col === "@timestamp"
                      ? alert._source && alert._source[col]
                        ? new Date(String(alert._source[col])).toLocaleString()
                        : "-"
                      : col === "kibana.alert.status"
                        ? (
                          <Badge
                            className={
                              alert._source && alert._source[col] === "active"
                                ? "badge-error"
                                : alert._source && alert._source[col] === "recovered"
                                  ? "badge-ok"
                                  : "bg-blue-100 text-blue-700 border border-blue-300"
                            }
                          >
                            {alert._source && alert._source[col]
                              ? String(alert._source[col]).charAt(0).toUpperCase() + String(alert._source[col]).slice(1)
                              : "-"}
                          </Badge>
                        )
                        : alert._source && alert._source[col] !== undefined && alert._source[col] !== null
                          ? String(alert._source[col])
                          : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      <div className="flex justify-center align-middle mt-4 space-x-2">
        <Button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-color">
          <span className="select-none">Previous</span>
        </Button>
        <span className="pt-1">Page {page} / {totalPages}</span>
        <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-color">
          <span className="select-none">Next</span>
        </Button>
      </div>
    </div>
  );
}
