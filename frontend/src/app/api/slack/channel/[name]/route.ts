import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ name: string }> } 
  ) {
    const { name } = await params; 
    if (!name) {
        return NextResponse.json({ error: 'Missing name parameter' }, { status: 400 });
    }

    const token = req.headers.get("Authorization"); 
    if (!name && !token) {
        return NextResponse.json({ error: 'Missing name parameter' }, { status: 400 });
    }

    try {
        // Create a Slack client
        const client = new WebClient(token ?? undefined);
        if (!client) {
            return NextResponse.json({ error: 'Failed to create Slack client' }, { status: 500 });
        }
        console.log("Fetching Slack channels with name:", name);
        const conversationsList = await client.conversations.list({ types: 'public_channel,private_channel' });
        console.log("Slack conversations list response:", conversationsList);
        if (!conversationsList.ok) {
            return NextResponse.json({ error: `Slack API error: ${conversationsList.error}` }, { status: 500 });
        }
        // Fetch the Slack channel information

        if (!conversationsList.channels) {
            return NextResponse.json({ error: 'No channels found' }, { status: 404 });
        }
        const channel = conversationsList.channels.find((channel) => channel.name === name);

        if (!channel) {
            return NextResponse.json({ error: `Channel with name ${name} not found` }, { status: 404 });
        }
        return NextResponse.json(channel, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { error: `Failed to fetch channel information: ${err instanceof Error ? err.message : "Unknown error"}` },
            { status: 500 }
        );
    }
}