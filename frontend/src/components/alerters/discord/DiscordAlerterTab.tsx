// DiscordAlerterTab.tsx
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { saveDiscordAlerter } from "@/components/alerters/discord/DiscordService"; // Assurez-vous que cette fonction existe
import { Card, CardContent } from "@/components/ui/card"
import EditButton from "@/components/alerters/ui/EditButton"; // Assurez-vous que ce composant existe
import { DiscordAlerter } from "@/types/alerters"; // Assurez-vous que ce type est défini correctement
import { Alerter } from "@/types/alerters"; // Assurez-vous que ce type est défini correctement
import AlertersMenu from "@/components/alerters/ui/AlertersMenu";
import AlertersTextArea from "@/components/alerters/ui/AlertersTextArea";
const type = "discord"; // Définir le type d'alerter

export const FormSchema = z.object({
    "id": z.string().optional(),
    "name": z.string().min(1, {
        message: "Username must be at least 1 characters.",
    }).min(2, {
        message: "Username must be at least 2 characters.",
    }),
    "description": z.string().optional(),
    "type": z.literal(type),


    "config": z.object({
        "firedMessageTemplate": z.string().optional(),
        "recoveredMessageTemplate": z.string().optional(),
        "channelName": z.string().optional(),
        "channelId": z.string().min(1, {
            message: "Channel ID must be at least 1 characters.",
        }),
        "token": z.string().min(1, {
            message: "Discord token must be at least 1 characters.",
        }),

    }),
    "all_rules": z.boolean().default(false).optional(),
    "rules": z.array(z.object({
        "id": z.string(),
        "name": z.string(),
    })).optional(),
    "enabled": z.boolean().default(true).optional(),
    "created_at": z.string().optional(),
    "updated_at": z.string().optional(),

})


async function getDiscordChannelName(channelId: string, token: string): Promise<string> {
    return fetch(`/api/discord/channel/${channelId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bot ${token}`,
        },
    })

        .then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch channel name: ${res.statusText}`);
            }

            return res.json();
        })
        .then((data) => data.name)
        .catch((error) => {
            console.error(error);
            return undefined;
        });
}



interface DiscordTabProps {
    alerters: Alerter[] | undefined[];
    editAlerter: Alerter | null;
    initialValues?: Alerter | null;
}

export default function DiscordAlerterTab({

    initialValues
}: DiscordTabProps) {

    const [alerters, setAlerters] = useState<DiscordAlerter[]>([]);
    const [editAlerter, setEditAlerter] = useState<DiscordAlerter | null>(null);
    const [rules, setRules] = useState<{ id: string; name: string }[]>([]);
    const [allRules, setAllRules] = useState(false);
    const [allChecked, setAllChecked] = useState(false);
    const [channelName, setChannelName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    type AlerterFormData = z.infer<typeof FormSchema>;
    const form = useForm<AlerterFormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: initialValues?.type === type ? initialValues : {
            id: "",
            name: "Discord - new",
            type: type,
            description: "",
            config: {
                firedMessageTemplate: "",
                recoveredMessageTemplate: "",
                token: "",
                channelId: "",
                channelName: "",
            },
            enabled: false, // Disable by default
            all_rules: true,
            rules: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    })

    function addDiscordAlerter() {
        setLoading(true);
        const data: DiscordAlerter = {
            name: "Discord",
            type: type,

            description: "",
            config: {

                firedMessageTemplate: "",
                recoveredMessageTemplate: "",
                token: "",
                channelId: "",
                channelName: "",
            },
            enabled: false,
            all_rules: true,
            rules: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        saveDiscordAlerter(data, setAlerters, setEditAlerter);

        setLoading(false);


    }


    useEffect(() => {
        fetch(`/api/alerters?type=${type}`)
            .then((res) => res.json())
            .then((data) => {
                setAlerters(data);
                if (data.length === 0) {
                    toast.info("No alerters found. Please add a new alerter.");
                }
                // ✅ sélectionne automatiquement le 1er alerter du tab
                setEditAlerter(data[0] ?? null);
            });
    }, []);
    useEffect(() => {
        setLoading(false);
        if (initialValues) {
            if (initialValues?.type === type) {
                form.reset(initialValues);
            }
        }
    }, [initialValues]);
    useEffect(() => {
        fetch("/api/kibana/rules?limit=10000")
            .then((res) => res.json())
            .then((data) => {
                setRules(data.data);

                const channelId = form.getValues("config.channelId");
                const token = form.getValues("config.token");
                if (channelId && token) {
                    getDiscordChannelName(channelId, token).then((name) => {
                        form.setValue("config.channelName", name, { shouldValidate: true });
                        setChannelName(name);
                    });
                }
            });
    }, []);

    useEffect(() => {

        if (editAlerter) {

            setChannelName(editAlerter.config.channelName || null);
            if (editAlerter?.type === type) {

                form.reset(editAlerter);

            }
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
                                            addAlerter={addDiscordAlerter}
                                            type={type}
                                        />
                                    </div>

                                    <div className="flex flex-col items-center justify-center">
                                        <Button
                                            className="w-full max-w-[200px] mt-5 cursor-pointer"
                                            variant="outline"
                                            onClick={addDiscordAlerter}
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




                        {/* Formulaire */}
                        <Card
                            className={`col-2  ml-70 overflow-y-auto border-none shadow-none h-[calc(100vh-190px)] ${editAlerter ? "p-0" : "p-6"}`}
                        >
                            <CardContent>

                                <div >

                                    <Form {...form}   >

                                        <form
                                            onSubmit={form.handleSubmit((data) => {
                                                saveDiscordAlerter(data, setAlerters);

                                            })}
                                            className="space-y-6 max-h-full w-full"
                                        >
                                            <div >
                                                <EditButton

                                                    setEditAlerter={setEditAlerter}
                                                    editAlerter={editAlerter}
                                                    loading={loading}
                                                    alerters={alerters}
                                                    setAlerters={setAlerters}
                                                    type={type}
                                                />

                                                <ScrollArea className="form-wrapper">

                                                    <div className="flex flex-col gap-4 w-full pr-4 mb-6">

                                                        <FormField
                                                            control={form.control}
                                                            name="enabled"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Enabled</FormLabel>
                                                                    <FormControl >
                                                                        <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-main-600 data-[state=checked]:hover:bg-main-500 data-[state=unchecked]:bg-gray-500" />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Enable this alerter
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="created_at"
                                                            render={({ field }) => (
                                                                <FormItem className="hidden">
                                                                    <FormLabel>Created</FormLabel>
                                                                    <FormControl >
                                                                        <input type="text" value={field.value} readOnly />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Enable this alerter
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField control={form.control} name="name" render={({ field }) => (
                                                            <FormItem className="w-full">
                                                                <FormLabel>Alerter name</FormLabel>
                                                                <FormControl>
                                                                    <Input

                                                                        placeholder="shadcn"
                                                                        {...field}

                                                                    />
                                                                </FormControl>
                                                                <FormDescription>
                                                                    This is your alerter display name.
                                                                </FormDescription>
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
                                                                    <FormDescription>
                                                                        This is your alerter display name.
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>

                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}

                                                            name="config.token"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Discord token</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="password" autoComplete="off" {...field}


                                                                        />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        This is your Discord bot token.
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>

                                                            )}
                                                        />
                                                        <div className="grid grid-cols-2 gap-4">

                                                            <FormField
                                                                control={form.control}
                                                                name="config.channelId"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Channel ID</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="123456789012345678"
                                                                                autoComplete="false"
                                                                                {...field}
                                                                                onBlur={() => {
                                                                                    if (field.value) {

                                                                                        getDiscordChannelName(field.value, form.getValues("config.token"))
                                                                                            .then((name) => {
                                                                                                form.setValue("config.channelName", name, { shouldValidate: true });
                                                                                                setChannelName(name);
                                                                                                setEditAlerter(form.getValues() as DiscordAlerter);
                                                                                            });
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormDescription>
                                                                            This is the ID of the Discord channel where alerts will be sent.
                                                                        </FormDescription>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="config.channelName"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Channel name</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="123456789012345678"
                                                                                autoComplete="false"
                                                                                readOnly
                                                                                disabled

                                                                                {...field}

                                                                                value={channelName || field.value}
                                                                            />
                                                                        </FormControl>
                                                                        <FormDescription>
                                                                            this will be automatically filled with channel name.
                                                                        </FormDescription>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                        
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
                                                                        Discord use Markdown syntax, so you can use **bold**, *italic*, `inline code`, and [links](https://example.com). <br />
                                                                        See <a href="https://discord.com/developers/docs/reference#message-formatting" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Discord formatting</a> for more details.

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
                                                                        Discord use Markdown syntax, so you can use **bold**, *italic*, `inline code`, and [links](https://example.com). <br />
                                                                        See <a href="https://discord.com/developers/docs/reference#message-formatting" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Discord formatting</a> for more details.
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
                                                                                            checked={allChecked}
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
                <Button className="max-w-[200px] mt-5" variant="outline" onClick={addDiscordAlerter} >
                    <Plus className="mr-2" />
                    Add Discord Alerter
                </Button>
            )}
        </>
    );
}
