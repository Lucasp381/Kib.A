"use client";

import { Code, History } from "lucide-react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { faDiscord, faMicrosoft, faSlack, faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { ExtendedColumnDef } from "@/components/DataTable/data-table";

const alerterType = [
    { value: "discord", label: "Discord", icon: <FontAwesomeIcon icon={faDiscord} className="text-main-500" /> },
    { value: "slack", label: "Slack", icon: <FontAwesomeIcon icon={faSlack} className="text-main-500" /> },
    { value: "email", label: "Email", icon: <FontAwesomeIcon icon={faEnvelope} className="text-main-500" /> },
    { value: "teams", label: "Teams", icon: <FontAwesomeIcon icon={faMicrosoft} className="text-main-500" /> },
    { value: "telegram", label: "Telegram", icon: <FontAwesomeIcon icon={faTelegram} className="text-main-500" /> },
    { value: "custom", label: "Custom", icon: <Code className="text-main-500" /> },
];
export type HistoryItem = {
    "@timestamp": string;
    _id: string;
    _source: {
        "@timestamp": string;
        message: string;
        "meta": {
            "alerter": {
                "id": string;
                "name": string;
                "type": string;
            };
            "rule": {
                "uuid": string;
                "name": string;
            };
        };
    };
    type: string;
};
export const columns: ExtendedColumnDef<HistoryItem>[] = [
  {
    id: "_source.@timestamp",
    accessorKey: "_source.@timestamp",
    title: "Timestamp",
    header: ({ column }) => <DataTableColumnHeader column={column} title={"Timestamp"} />,
    cell: ({ cell }) => {
      if (!cell.getValue()) {
        return null;
      }

      return <div className="font-medium">{new Date(String(cell.getValue())).toLocaleString()}</div>;
    },
  },
    {
    id: "_source.meta.alerter.type",
    accessorKey: "_source.meta.alerter.type",
    title: "Type",
    header: ({ column }) => <DataTableColumnHeader column={column} title={"Type"} />,

    cell: ({ cell }) => {
      const type = cell.getValue<string>();

      if (!type) {
        return null;
      }

      return (
        <div className="flex items-center">
          {alerterType.find(icon => icon.value === type)?.icon}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

    {
      id: "_source.meta.alerter.name",
    accessorKey: "_source.meta.alerter.name",
    title: "Alerter Name",
    header: ({ column }) => <DataTableColumnHeader column={column} title={"Alerter Name"} />,
  },
    {
      id: "_source.meta.rule.name",
    accessorKey: "_source.meta.rule.name",
    title: "Rule Name",
    header: ({ column }) => <DataTableColumnHeader column={column} title={"Rule Name"} />,
  },
  {
    id: "_id",
    accessorKey: "_id",
    title: "Notification ID",
    defaultVisible: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title={"Notification ID"} />,
  },
  {
    id: "_source.message",
    accessorKey: "_source.message",
    title: "Message",
    header: ({ column }) => <DataTableColumnHeader column={column} title={"Message"} />,
  },

  {
    id: "_source.meta.alerter.id",
    accessorKey: "_source.meta.alerter.id",
    title: "Alerter ID",
    defaultVisible: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title={"Alerter ID"} />,
  },

  {
    id: "_source.meta.rule.uuid",
    accessorKey: "_source.meta.rule.uuid",
    title: "Rule UUID",
    defaultVisible: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title={"Rule UUID"} />,
  }

  //{
  //  id: "actions",
  //  cell: ({ row }) => <DataTableRowActions row={row} />,
  //},
];
