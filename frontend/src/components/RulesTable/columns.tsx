"use client";


import { Badge } from "@/components/ui/badge";

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { rules } from "./rules";
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

export type RuleItem = {
  id: string;
  enabled: string;
  name: string;
  tags: string[];
  rule_type_id: string;
  consumer: string;
  schedule: {
    interval: string;
  };
  params: {
    criteria: {
      comparator: string;
      metrics: {
        name: string;
        aggType: string;
      }[];
      threshold: number[];
      timeSize: number;
      timeUnit: string;
      equation: string;
    }[];
    alertOnNoData: boolean;
    alertOnGroupDisappear: boolean;
    searchConfiguration: {
      query: {
        query: string;
        language: string;
      };
      index: string;
    };
  };
  scheduled_task_id: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  api_key_owner: string;
  api_key_created_by_user: boolean;
  throttle: string | null;
  mute_all: boolean;
  notify_when: string | null;
  muted_alert_ids: string[];
  execution_status: {
    status: string;
    last_execution_date: string;
    last_duration: number;
  };
  last_run: {
    outcome: string;
    outcome_order: number;
    warning: string | null;
    outcome_msg: string | null;
    alerts_count: {
      new: number;
      ignored: number;
      recovered: number;
      active: number;
    };
  };
  next_run: string;
  revision: number;
  running: boolean;
  alert_delay: {
    active: number;
  };
  flapping: {
    look_back_window: number;
    status_change_threshold: number;
  };
};
async function fetchKibanaUrl() {
  const res = await fetch(`/api/kibana/url`);
  const result = await res.json();
  return result.url;
}
const KIBANA_URL = await fetchKibanaUrl();
export const columns: ExtendedColumnDef<RuleItem>[] = [
  {
    id: "name",
    accessorFn: (row: RuleItem) => row.name,
    title: "Rule Name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rule Name" />, 
    defaultVisible: true,
  },
  {
    id: "enabled",
    accessorFn: (row: RuleItem) => row.enabled,
    title: "Enabled",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Enabled" />, 
    cell: ({ cell }) => cell.getValue() == "true" ? <Badge className="badge-ok">Enabled</Badge> : <Badge className="badge-error">Disabled</Badge>,
    defaultVisible: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },

  {
    id: "rule_type",
    accessorFn: (row: RuleItem) => row.rule_type_id,
    title: "Type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />, 
    defaultVisible: true,
    cell: ({ cell }) => rules.find(rule => rule.id === cell.getValue())?.name ? <>{rules.find(rule => rule.id === cell.getValue())?.name}</> : cell.getValue(),
  },
    {
    id: "created_at",
    accessorFn: (row: RuleItem) => row.created_at,
    title: "Created At",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />, 
    cell: ({ cell }) => cell.getValue() ? new Date(String(cell.getValue())).toLocaleString() : null,
    defaultVisible: true,
  },
    {
    id: "updated_at",
    accessorFn: (row: RuleItem) => row.updated_at,
    title: "Updated At",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />, 
    cell: ({ cell }) => cell.getValue() ? new Date(String(cell.getValue())).toLocaleString() : null,
    defaultVisible: true,
  },
    {
    id: "created_by",
    accessorFn: (row: RuleItem) => row.created_by,
    title: "Created By",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />, 
    defaultVisible: true,
  },
    {
    id: "tags",
    accessorFn: (row: RuleItem) => row.tags ? row.tags.join(", ") : "",
    title: "Tags",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tags" />, 
    defaultVisible: false,
  },
  {
    id: "consumer",
    accessorFn: (row: RuleItem) => row.consumer,
    title: "Consumer",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Consumer" />, 
    defaultVisible: false,
  },



  {
    id: "execution_status.status",
    accessorFn: (row: RuleItem) => row.execution_status?.status,
    title: "Execution Status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Execution Status" />, 
    defaultVisible: true,
  },
  {
    id: "last_run.outcome",
    accessorFn: (row: RuleItem) => row.last_run?.outcome,
    title: "Last Outcome",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Outcome" />, 
    defaultVisible: false,
  },
  {
    id: "next_run",
    accessorFn: (row: RuleItem) => row.next_run,
    title: "Next Run",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Next Run" />, 
    cell: ({ cell }) => cell.getValue() ? new Date(String(cell.getValue())).toLocaleString() : null,
    defaultVisible: true,
  },
  {
    id: "revision",
    accessorFn: (row: RuleItem) => row.revision,
    title: "Revision",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Revision" />, 
    defaultVisible: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} kibanaUrl={KIBANA_URL} />,
  },
];
