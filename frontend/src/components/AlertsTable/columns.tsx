"use client";


import { Badge } from "@/components/ui/badge";

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";

import { ExtendedColumnDef } from "@/components/DataTable/data-table";
import { DataTableRowActions } from "./data-table-row-actions";

function formatRemaining(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h > 0 ? `${h}h` : "", m > 0 ? `${m}m` : "", `${s}s`]
    .filter(Boolean)
    .join(" ");
}

export type AlertItem = {
  "_index": string;
  "_id": string;
  "_score": null,
  "_source": {
    "kibana.alert.reason": string;
    "kibana.alert.evaluation.values": Array<number>;
    "kibana.alert.evaluation.threshold": Array<number>;
    "tags": Array<string>;
    "kibana.alert.rule.category": string;
    "kibana.alert.rule.consumer": string;
    "kibana.alert.rule.execution.uuid": string;
    "kibana.alert.rule.name": string;
    "kibana.alert.rule.parameters": {
      "criteria": [
        {
          "comparator": string,
          "metrics": [
            {
              "name": string,
              "aggType": string
            }
          ],
          "threshold": Array<number>,
          "timeSize": number,
          "timeUnit": string
        }
      ],
      "alertOnNoData": boolean,
      "alertOnGroupDisappear": boolean,
      "searchConfiguration": {
        "query": {
          "query": string,
          "language": string
        },
        "index": string
      }
    },
    "kibana.alert.rule.producer": string,
    "kibana.alert.rule.revision": number,
    "kibana.alert.rule.rule_type_id": string,
    "kibana.alert.rule.tags": Array<string>,
    "kibana.alert.rule.uuid": string,
    "kibana.space_ids": Array<string>,
    "@timestamp": string,
    "event.action": string,
    "event.kind": string,
    "kibana.alert.rule.execution.timestamp": string,
    "kibana.alert.action_group": string,
    "kibana.alert.flapping": boolean,
    "kibana.alert.flapping_history": Array<boolean>,
    "kibana.alert.instance.id": string,
    "kibana.alert.maintenance_window_ids": Array<string>,
    "kibana.alert.consecutive_matches": number,
    "kibana.alert.pending_recovered_count": number,
    "kibana.alert.status": string,
    "kibana.alert.uuid": string,
    "kibana.alert.workflow_status": string,
    "kibana.alert.duration.us": number,
    "kibana.alert.start": string,
    "kibana.alert.time_range": {
      "gte": string
    },
    "kibana.version": string,
    "kibana.alert.previous_action_group": string
  },
  "sort": [1756634354494]
};
async function fetchKibanaUrl() {
  const res = await fetch(`/api/kibana/url`);
  const result = await res.json();
  return result.url;
}
const KIBANA_URL = await fetchKibanaUrl();
export const columns: ExtendedColumnDef<AlertItem>[] = [
  {
    id: "_source.@timestamp",
    accessorKey: "_source.@timestamp",
    title: "Timestamp",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Timestamp" />,
    cell: ({ cell }) => cell.getValue() ? new Date(String(cell.getValue())).toLocaleString() : null,
    defaultVisible: true,
  },

  {
    id: "_source.kibana.alert.status",
    accessorFn: (row: AlertItem) => row._source["kibana.alert.status"],
    title: "Status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;

      return (<Badge
        className={
          value === "active"
            ? "badge-error"
            : value === "recovered"
              ? "badge-ok"
              : "bg-blue-100 text-blue-700 border border-blue-300"
        }>{value
          ? String(value).charAt(0).toUpperCase() + String(value).slice(1)
          : "-"}
      </Badge>)

    },
    defaultVisible: true,
        filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "_source.kibana.alert.rule.name",
    accessorFn: (row: AlertItem) => row._source["kibana.alert.rule.name"],
    title: "Rule Name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rule Name" />,
    defaultVisible: true,
  },
  {
    id: "_source.kibana.alert.reason",
    accessorFn: (row: AlertItem) => row._source["kibana.alert.reason"],

    title: "Reason",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" />,
    defaultVisible: true,
  },
  {
    id: "_id",
    accessorFn: (row: AlertItem) => row._id,
    title: "ID",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    defaultVisible: false,
  },
  {
    id: "_source.kibana.alert.duration.us",
    accessorFn: (row: AlertItem) => row._source["kibana.alert.duration.us"],
    title: "Duration",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      // convert to seconds
      return value ? formatRemaining(Math.floor(value / 1000000)) : null;
    },
    defaultVisible: false,
  },
  {
    id: "_source.kibana.alert.workflow_status",
    accessorFn: (row: AlertItem) => row._source["kibana.alert.workflow_status"],
    title: "Workflow Status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Workflow Status" />,
    defaultVisible: false,
  },
  {
   id: "actions",
  cell: ({ row }) => <DataTableRowActions row={row} kibanaUrl={KIBANA_URL} />,
  },
];
