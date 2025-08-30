'use client';

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableRow, TableCell, TableHeader } from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faMicrosoft, faSlack, faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Code } from "lucide-react";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
type HistoryItem = {
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
const icons = [
    { value: "discord", label: "Discord", icon: <FontAwesomeIcon icon={faDiscord} className="text-main-500" /> },
    { value: "slack", label: "Slack", icon: <FontAwesomeIcon icon={faSlack} className="text-main-500" /> },
    { value: "email", label: "Email", icon: <FontAwesomeIcon icon={faEnvelope} className="text-main-500" /> },
    { value: "teams", label: "Teams", icon: <FontAwesomeIcon icon={faMicrosoft} className="text-main-500" /> },
    { value: "telegram", label: "Telegram", icon: <FontAwesomeIcon icon={faTelegram} className="text-main-500" /> },
    { value: "custom", label: "Custom", icon: <Code className="text-main-500" /> },
];

const columns = ["Timestamp", "Type", "Alerter", "Message", "Rule"];
const cardClass = "p-6 border-none border-gray-300 shadow-none rounded-none bg-herit";

export default function HistoryPage() {
    const [historyData, setHistoryData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const { widths, startResize } = useResizableColumns(columns);

    
    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(
                `/api/backend/elastic/index/history?limit=${pageSize}&page=${currentPage}`
            );
            const result = await res.json();
            setHistoryData(result.data || []);
        };

        fetchData();
    }, [currentPage, pageSize]);

    return (
        <Card className={cardClass}>
            <ScrollArea className="overflow-y-auto">
                <Table className="table-fixed w-full">
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead
                                    key={col}
                                    style={{ width: widths[col] }}
                                    className="relative group select-none"
                                >{col}  <span
                                        onMouseDown={(e) => startResize(col, e)}
                                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent group-hover:bg-gray-300"
                                    /></TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {historyData.map((item: HistoryItem) => (
                            <TableRow key={item._id}>
                                <TableCell className="truncate max-w-0">{item._source["@timestamp"] ? new Date(String(item._source["@timestamp"])).toLocaleString() : "N/A"}</TableCell>
                                <TableCell className="truncate max-w-0" title={item._source.meta.alerter.type ? String(item._source.meta.alerter.type).charAt(0).toUpperCase() + String(item._source.meta.alerter.type).slice(1) : "N/A"}>
                                    {icons.find(icon => icon.value === item._source.meta.alerter.type)?.icon}
                                </TableCell>
                                <TableCell className="truncate max-w-0">{item._source.meta.alerter.name ? String(item._source.meta.alerter.name) : "N/A"}</TableCell>
                                <TableCell className="truncate max-w-0">{item._source.message ? String(item._source.message) : "N/A"}</TableCell>
                                <TableCell className="truncate max-w-0">{item._source.meta.rule.name ? String(item._source.meta.rule.name) : "N/A"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* Pagination */}
      <div className="flex space-x-2 justify-center  mt-5 pr-[250px]">
        <Button disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)} className="btn-color">
          <span className="select-none">Previous</span>
        </Button>
        <span className="pt-1">Page {currentPage} / {totalPages}</span>
        <Button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="btn-color">
          <span className="select-none">Next</span>
        </Button>
      </div>
            </ScrollArea>
        </Card>
    );
}
