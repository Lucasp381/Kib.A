// SlackAlerterTab.tsx
import React, { useEffect, useState } from "react";
import { Form, FormField, FormItem, FormControl, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

import AlertersMenu from "@/components/alerters/ui/AlertersMenu";
import AlertersTextArea from "@/components/alerters/ui/AlertersTextArea";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { saveTelegramAlerter } from "@/components/alerters/telegram/TelegramService";
import EditButton from "@/components/alerters/ui/EditButton";
import { TelegramAlerter, Alerter } from "@/types/alerters";


const type = "telegram";

const FormSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    type: z.literal(type),
    config: z.object({
        firedMessageTemplate: z.string().optional(),
        recoveredMessageTemplate: z.string().optional(),
        chatId: z.string(),
        token: z.string().min(19, { message: "Telegram token must be at least 19 characters." }),
    }),
    all_rules: z.boolean(),
    rules: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
    enabled: z.boolean().default(true).optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});



interface TelegramTabProps {
    alerters: Alerter[] | undefined[];
    editAlerter: Alerter | null;
    initialValues?: Alerter | null;
}

export default function TelegramAlerterTab({ initialValues }: TelegramTabProps) {
    const [alerters, setAlerters] = useState<TelegramAlerter[]>([]);
    const [editAlerter, setEditAlerter] = useState<TelegramAlerter | null>(null);
    const [rules, setRules] = useState<{ id: string; name: string }[]>([]);
    const [allChecked, setAllChecked] = useState(false);
    const [channelId, setChannelId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: initialValues?.type === type ? initialValues : {
            id: "",
            name: "Telegram - new",
            type,
            description: "",
            config: { firedMessageTemplate: "", recoveredMessageTemplate: "", token: "", chatId: "0" },
            enabled: false, // Disable by default
            all_rules: false,
            rules: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    });

    const addTelegramAlerter = () => {
        setLoading(true);
        const newAlerter: TelegramAlerter = {
            name: "Telegram",
            type,
            description: "",
            config: { firedMessageTemplate: "", recoveredMessageTemplate: "", token: "", chatId: "0" },
            enabled: false,
            all_rules: false,
            rules: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        saveTelegramAlerter(newAlerter, setAlerters, setEditAlerter);
        setLoading(false);
    };

    useEffect(() => {
        fetch(`/api/alerters?type=${type}`)
            .then((res) => res.json())
            .then((data) => {
                setAlerters(data);
                if (data.length === 0) toast.info("No alerters found. Please add a new alerter.");
                setEditAlerter(data[0] ?? null);
            });
    }, []);

    useEffect(() => {
        if (initialValues?.type === type) form.reset(initialValues);
    }, [initialValues]);

    useEffect(() => {
        fetch("/api/kibana/rules?limit=10000")
            .then((res) => res.json())
            .then((data) => {
                setRules(data.data);
            });
    }, []);

    useEffect(() => {
        if (editAlerter?.type === type) {
            form.reset(editAlerter);
        }

    }, [editAlerter]);

    return (
        <>
            {alerters.length > 0 ? (
                <Card className="flex w-full m-0 p-0 rounded-none border-none shadow-none ">
                    <div className="grid col-span-2 grid-cols-[auto_1fr] ">
                        {/* Liste des alerters */}
                        <Card className="fixed flex col-1 border-none shadow-none h-[calc(100vh-190px)] w-70">
                            <CardContent className="flex p-0 m-0">
                                <div className="flex flex-col gap-2 w-full h-[calc(100vh-190px)]">
                                    <div className="flex flex-col gap-2 ">
                                        <AlertersMenu
                                            alerters={alerters}
                                            editAlerter={editAlerter}
                                            setEditAlerter={setEditAlerter as React.Dispatch<React.SetStateAction<Alerter | null>>}
                                            addAlerter={addTelegramAlerter}
                                            type={type}
                                        />
                                    </div>

                                    <div className="flex flex-col items-center justify-center">
                                        <Button
                                            className="w-full max-w-[200px] mt-5 cursor-pointer"
                                            variant="outline"
                                            onClick={addTelegramAlerter}
                                        >
                                            <Plus className="mr-2" />
                                            Add {type.charAt(0).toUpperCase() + type.slice(1)} Alerter
                                        </Button>
                                    </div>
                                </div>
                                <div
                                    className="self-stretch w-[1px] mx-5 bg-gray-300 opacity-50"
                                    aria-hidden
                                />
                            </CardContent>
                        </Card>
                        <Card
                            className={`col-2  ml-70 overflow-y-auto border-none shadow-none h-[calc(100vh-190px)] ${editAlerter ? "p-0" : "p-6"}`}
                        >
                            <CardContent>

                                <div >

                                    <Form {...form}   >

                                        <form
                                            onSubmit={form.handleSubmit((data) => {
                                                console.log("Saving alerter data:", data);
                                                saveTelegramAlerter(data, setAlerters);

                                            })}
                                            className="space-y-6 max-h-full w-full"
                                        >
                                            <div>
                                                <EditButton

                                                    setEditAlerter={setEditAlerter}
                                                    editAlerter={editAlerter}
                                                    loading={loading}
                                                    alerters={alerters}
                                                    setAlerters={setAlerters}
                                                    type={type}
                                                />
                                                <ScrollArea>
                                                    <div className="flex flex-col gap-4 pr-4 mb-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="enabled"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Enabled</FormLabel>
                                                                    <FormControl>
                                                                        <Switch
                                                                            checked={field.value}
                                                                            onCheckedChange={field.onChange}
                                                                            className="data-[state=checked]:bg-main-600 data-[state=unchecked]:bg-gray-500"
                                                                        />
                                                                    </FormControl>
                                                                    <FormDescription>Enable this alerter</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="name"
                                                            render={({ field }) => (
                                                                <FormItem className="w-full">
                                                                    <FormLabel>Alerter name</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="shadcn" {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>This is your alerter display name.</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="description"
                                                            render={({ field }) => (
                                                                <FormItem className="w-full">
                                                                    <FormLabel>Description</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="Description" {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>This is your alerter description.</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="config.token"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Telegram bot token</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="password" autoComplete="off" {...field} onChange={(e) => field.onChange(e.target.value)} />
                                                                    </FormControl>
                                                                    <FormDescription>This is your Telegram bot token.</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />




                                                        <FormField
                                                            control={form.control}
                                                            name="config.chatId"

                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel >Chat ID</FormLabel>
                                                                    <FormControl>
                                                                        <Input  placeholder="Channel ID" className="w-[200px]"   {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        this is the chat ID.
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />


                                                        <FormField
                                                            control={form.control}
                                                            name="config.firedMessageTemplate"
                                                            render={({ field }) => (
                                                                <FormItem className="w-full">
                                                                    <FormLabel>Fired Message</FormLabel>
                                                                    <FormControl>
                                                                        <AlertersTextArea
                                                                            id="firedMessageTemplate"
                                                                            value={field.value}       // controlled
                                                                            onChange={field.onChange} // propagate correctly
                                                                            placeholder="Alert: {_source.kibana.alert.rule.name}"
                                                                        />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        This is the message template for alerts. Right clic to use Emoji or placeholders.<br />
                                                                        Telegram use simple HTML style<br />
                                                                        See <a href="http://core.telegram.org/bots/update56kabdkb12ibuisabdubodbasbdaosd#html-style" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Telegram formatting</a> for more details.
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="config.recoveredMessageTemplate"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Recovered Message</FormLabel>
                                                                    <FormControl>
                                                                        <AlertersTextArea
                                                                            id="recoveredMessageTemplate"
                                                                            value={field.value}       // controlled
                                                                            onChange={field.onChange} // propagate correctly
                                                                            placeholder="Alert: {_source.kibana.alert.rule.name}"
                                                                        />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        This is the message template for alerts. Right clic to use Emoji or placeholders.<br />
                                                                        Telegram use simple HTML style<br />
                                                                        See <a href="http://core.telegram.org/bots/update56kabdkb12ibuisabdubodbasbdaosd#html-style" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Telegram formatting</a> for more details.
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="all_rules"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>All Rules</FormLabel>
                                                                    <FormControl>
                                                                        <Switch
                                                                            checked={field.value}
                                                                            onCheckedChange={
                                                                                (checked) => {
                                                                                    field.onChange(checked);
                                                                                    if (checked) {
                                                                                        setEditAlerter(editAlerter ? { ...editAlerter, all_rules: true } : null);

                                                                                    } else {
                                                                                        setEditAlerter(editAlerter ? { ...editAlerter, all_rules: false } : null);
                                                                                    }
                                                                                }
                                                                            }
                                                                            className="data-[state=checked]:bg-main-600 data-[state=unchecked]:bg-gray-500"
                                                                        />
                                                                    </FormControl>
                                                                    <FormDescription>Select all rules</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        {!editAlerter?.all_rules && (<FormField
                                                            control={form.control}
                                                            name="rules"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Rules</FormLabel>
                                                                    <FormControl>
                                                                        <Table className="h-[200px] overflow-y-auto">
                                                                            <TableHeader>
                                                                                <TableRow>
                                                                                    <TableHead>
                                                                                        <Checkbox
                                                                                            checked={editAlerter?.all_rules}
                                                                                            onCheckedChange={(checked) => {
                                                                                                setAllChecked(!!checked);
                                                                                                field.onChange(checked ? rules : []);
                                                                                            }}
                                                                                        />
                                                                                    </TableHead>
                                                                                    <TableHead>Rule ID</TableHead>
                                                                                    <TableHead>Rule Name</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {rules.map((rule) => (
                                                                                    <TableRow key={rule.id}>
                                                                                        <TableCell>
                                                                                            <Checkbox
                                                                                                checked={field.value?.some((r) => r.id === rule.id)}
                                                                                                onCheckedChange={(checked) => {
                                                                                                    field.onChange(
                                                                                                        checked
                                                                                                            ? [...(field.value || []), rule]
                                                                                                            : field.value?.filter((r) => r.id !== rule.id)
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                        </TableCell>
                                                                                        <TableCell>{rule.id}</TableCell>
                                                                                        <TableCell>{rule.name}</TableCell>
                                                                                    </TableRow>
                                                                                ))}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </FormControl>
                                                                    <FormDescription>Choose rules</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>)}
                                                        />)}

                                                    </div>
                                                    <ScrollBar />
                                                </ScrollArea>
                                            </div>
                                        </form>
                                    </Form>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </Card>
            ) : (
                <Button className="max-w-[200px] mt-5" variant="outline" onClick={addTelegramAlerter}>
                    <Plus className="mr-2" />
                    Add Telegram Alerter
                </Button>
            )}
        </>
    );
}
