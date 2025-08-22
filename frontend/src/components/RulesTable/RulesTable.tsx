import React, { useEffect, useState, useRef } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ruleFieldMap } from "@/lib/alertFieldMap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useElasticKV } from "@/hooks/useElasticKV";
import { Rule } from "@/types/rules";
import { Scroll } from "lucide-react";
interface RulesTableProps {
  pageSize?: number;
}
export default function RulesTable({ pageSize = 10 }: RulesTableProps) {
  const [rules, setRules] = useState<Rule[]>([]);
  const ruleColumns: Array<keyof typeof ruleFieldMap> = Object.keys(ruleFieldMap) as Array<keyof typeof ruleFieldMap>;
  const [ruleTypeNames, setRuleTypeNames] = useState<{ [id: string]: string }>({});
  const loadedTypesRef = useRef<Set<string>>(new Set());
  const [KIBANA_URL, setKIBANA_URL] = useState<string | null>(null);
  const { get } = useElasticKV();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRules = async () => {
    await get('KIBANA_URL').then((response) => {
      if (response.ok && response.value) {
        setKIBANA_URL(response.value);
      }
    });
    fetch(`/api/kibana/rules?limit=${pageSize}&page=${page}`)
      .then((res) => res.json())
      .then((result) => {
        setRules(result.data);
        console.log("rules", result.data);
        setTotalPages(result.totalPages || 1);
      });
  };

  useEffect( () => {
     fetchRules();
  }, []);

  useEffect(() => {
    if (!rules) return;

    const ids = rules.map((rule: Rule) => rule.rule_type_id);
    const uniqueIds = Array.from(new Set(ids));

    const toFetch = uniqueIds.filter(id => !loadedTypesRef.current.has(id));
    if (toFetch.length === 0) return;

    Promise.all(
      toFetch.map((id: string) =>
        fetch(`/api/kibana/rules/type?id=${id}`)
          .then(res => res.json())
          .then(data => ({ id, name: data.name || id }))
          .catch(() => ({ id, name: id }))
      )
    ).then(results => {
      setRuleTypeNames(prev => ({
        ...prev,
        ...Object.fromEntries(results.map(r => [r.id, r.name])),
      }));
      results.forEach(r => loadedTypesRef.current.add(r.id));
    });
  }, [rules]);

  return (<>
    {rules.length === 0 ? (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Scroll className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-500">No rules found.</p>
        </div>
      </div>
    ) : (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              {ruleColumns.map((col) => (
                <TableHead key={col}>{ruleFieldMap[col]}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(rules) ? rules.map((rule: Rule) => (
              <TableRow key={rule.id}
                onDoubleClick={() => {
                  const ruleUuid = rule.id;
                  if (ruleUuid && KIBANA_URL) {
                    window.open(`${KIBANA_URL}/app/observability/alerts/rules/${ruleUuid}`, "_blank");
                  }
                }}
                className="cursor-pointer">
                {ruleColumns.map((col) => (
                  <TableCell key={col}>
                    {col === 'schedule.interval'
                      ? rule.schedule?.interval || '-'
                      : col === 'enabled'
                        ? rule.enabled === false ? <Badge className={"badge-error"}>Disabled</Badge> : <Badge className="badge-ok">Enabled</Badge>
                        : col === 'rule_type_id' ? ruleTypeNames[rule[col]] || rule[col] :
                          rule[col] !== undefined
                            ? String(rule[col])
                            : '-'
                    }
                  </TableCell>
                ))}
              </TableRow>
            )) : null}
          </TableBody>
        </Table>
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
      </>
    )}
  </>)
}