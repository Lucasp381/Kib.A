'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardDescription, CardContent } from "@/components/ui/card";
import {  useEffect, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { useElasticKV } from "@/hooks/useElasticKV";
import { Label } from "@radix-ui/react-label";

import AlertersTextArea from "@/components/alerters/ui/AlertersTextArea";
const cardClass = "p-6 border-none border-gray-300 shadow-none rounded-none bg-herit";

function VariablesTable() {
  const [variables, setVariables] = useState<{_index: string, _id: string, _score: number, _source: { data: string, "@timestamp": string }}[]>([]);
  const [editValues, setEditValues] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const { set, del } = useElasticKV();

  const [key, setKey] = useState('');
  const [value, setValue] = useState('');


  // Charger la liste des variables depuis l'API interne (backend)
  const fetchVariables = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backend/elastic/variables");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const filteredData = data.filter((v: { _id: string }) => !v._id.startsWith("internal."));
      setVariables(filteredData);
      console.log("Variables loaded", filteredData);
    } catch (err) {
      console.error("Error fetching variables", err);
      toast.error("Impossible de charger les variables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariables();
  }, []);

  const canAct = !loading;

  const handleChange = (id: string, val: string) => {
    setEditValues(prev => ({ ...prev, [id]: val }));
  };

  // Sauvegarder une modification d'une variable existante
  const handleSave = async (id: string) => {
    if (!canAct) return;
    setLoading(true);
    const newValue = editValues[id];
    if (newValue === undefined) {
      setLoading(false);
      return;
    }
    const r = await set(id, newValue);
    r.ok ? toast.success("Variable mise à jour avec succès") : toast.error(`Erreur: ${r.error}`);
    if (r.ok) {
      await fetchVariables();
      setEditValues(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
    setLoading(false);
  };

  // Ajouter une nouvelle variable
  const handleAdd = async () => {
    if (!canAct || !key) {
      toast.error("La clé est requise");
      return;
    }
    setLoading(true);
    const r = await set(key, value);
    r.ok ? toast.success("Variable ajoutée avec succès") : toast.error(`Erreur: ${r.error}`);
    if (r.ok) {
      setKey("");
      setValue("");
      await fetchVariables();
    }
    setLoading(false);
  };

  // Supprimer une variable par son id
  const handleDelete = async (id: string) => {
    if (!canAct) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la variable [${id}] ?`)) return;
    setLoading(true);
    const r = await del(id);
    r.ok ? toast.success("Variable supprimée avec succès") : toast.error(`Erreur: ${r.error}`);
    if (r.ok) {
      await fetchVariables();
    }
    setLoading(false);
  };

  // Filtrage selon recherche
  const filteredVariables = variables.filter(
    v =>
      v._id.toLowerCase().includes(search.toLowerCase()) ||
      String(v._source.data).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex gap-2 mb-4 justify-between">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-2 py-1 w-48"
          disabled={loading}
        />
        <div className="flex gap-2 justify-between">
          <input
            type="text"
            placeholder="New key"
            value={key}
            onChange={e => setKey(e.target.value)}
            className="border px-2 py-1 w-32"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="New data"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="border px-2 py-1 w-48"
            disabled={loading}
          />
          <Button onClick={handleAdd} className="px-2 py-1 bg-green-800 text-white cursor-pointer" disabled={!canAct}>
            Add
          </Button>
        </div>
      </div>

      <Table className="mt-2">
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Last modified</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredVariables && filteredVariables
            .sort((a, b) => b._source["@timestamp"].localeCompare(a._source["@timestamp"]))
            .map(variable => (
              <TableRow key={variable._id}>
                <TableCell>{variable._id}</TableCell>
                <TableCell>
                  <input
                    value={editValues[variable._id] ?? variable._source.data}
                    onChange={e => handleChange(variable._id, e.target.value)}
                    className="border px-2 py-1 w-full"
                    disabled={loading}
                  />
                </TableCell>
                <TableCell>{new Date(variable._source["@timestamp"]).toLocaleString()}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave(variable._id)}
                    disabled={loading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(variable._id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>


    </>
  );
}

function MainPage() {
  const cardClass = "p-6 border-none border-gray-300 shadow-none rounded-none bg-herit";
  const elasticKV = useElasticKV();


  const [defaultFiredMessageTemplate, setDefaultFiredMessageTemplate] = useState<string>(

  );
  const [defaultRecoveredMessageTemplate, setDefaultRecoveredMessageTemplate] = useState<string>(

  );

  useEffect(() => {
    elasticKV.get("internal.defaultFiredMessageTemplate").then(res => {
      // If the response is ok and has a value, set the defaultFiredMessageTemplate
      if (res.ok && res.value) setDefaultFiredMessageTemplate(res.value);
    });
    elasticKV.get("internal.defaultRecoveredMessageTemplate").then(res => {
      if (res.ok && res.value) setDefaultRecoveredMessageTemplate(res.value);
    });

  }, []);
  return (
    <Card className={cardClass}>
      <CardDescription className="mb-4">Configure your application</CardDescription>
      <CardContent>
        <Label className="mb-2" htmlFor="defaultFiredMessageTemplate">Default fired message template</Label>
        <AlertersTextArea
          id="defaultFiredMessageTemplate"
          placeholder="Default fired message template"
          onBlur={(e) => {
            elasticKV.set("internal.defaultFiredMessageTemplate", e.target.value);
            toast.success("Default fired message template updated");
          }} />
        <Label className="mb-2" htmlFor="defaultRecoveredMessageTemplate">Default fired message template</Label>
        <AlertersTextArea
          id="defaultRecoveredMessageTemplate"
          placeholder="Default recovered message template"
          onBlur={(e) => {
            elasticKV.set("internal.defaultRecoveredMessageTemplate", e.target.value);
            toast.success("Default recovered message template updated");
          }}
        />

      </CardContent>

    </Card>
  );
}
export default function SettingsPage() {
  const cardTitleClass = "text-xl font-bold";

  return (
    <Card className={cardClass}>

      <CardContent>
        <Tabs defaultValue="variables" className="w-full p-0 m-0">
          <TabsList>
            <TabsTrigger value="main">Main</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
          </TabsList>
          <TabsContent value="main">
            <MainPage />
          </TabsContent>
          <TabsContent value="variables">
            <VariablesTable />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
