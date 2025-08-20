import { estypes } from "@elastic/elasticsearch";

export interface ObservabilityAlertSource {
  "@timestamp"?: string;
  "kibana.alert.status"?: "active" | "recovered" | "unknown";
  "kibana.alert.rule.uuid"?: string;
  "kibana.alert.rule.name"?: string;
  // ajoute ici les champs que tu utilises vraiment
  [key: string]: unknown; // fallback
}

export type ObservabilityAlert = estypes.SearchHit<ObservabilityAlertSource>;
