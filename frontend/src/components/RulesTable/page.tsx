'use client'
import { useRef, useEffect, useState } from "react";
import { columns, RuleItem } from "./columns";
import DataTable from "@/components/DataTable/data-table";
import { Card,  CardTitle } from "@/components/ui/card";
import TitleCard from "@/components/menu/titleCard";
import { Cctv } from "lucide-react";
import { DataTableToolbar, globalFilterFn } from "./data-table-toolbar";

export default  function RulesTable() {
    const [ruleData, setRuleData] = useState([]);
    const cardClass = "p-6 border-none  border-blue-300 shadow-none rounded-none bg-herit pb-0 max-h-[80vh]";
    const [ruleTypeNames, setRuleTypeNames] = useState<{ [id: string]: string }>({});
    const loadedTypesRef = useRef<Set<string>>(new Set());

    const cardTitleClass = "text-xl font-bold mb-0";
     useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(
           `/api/kibana/rules`
            );
            const result = await res.json();
            //convert bool to string
            result.data = result.data.map((rule: RuleItem) => {
                rule.enabled = String(rule.enabled);
                return rule;
            });
            setRuleData(result.data || []);
        };

        fetchData();
    }, []);
    // Dans DataTable ou parent
useEffect(() => {
    if (!ruleData) return;

    const ids = ruleData.map((rule: RuleItem) => rule.rule_type_id);
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
  }, [ruleData]);


  // In Our example we use local data
  return (
    <Card className={cardClass}>
      <CardTitle className={cardTitleClass}><TitleCard Icon={<Cctv />} Title="Rules" /></CardTitle>
      
      <DataTable<RuleItem> data={ruleData} columns={columns} storageKey="rules" globalFilterFn={globalFilterFn} DataTableToolbar={DataTableToolbar}   />
    </Card>
  );
}
