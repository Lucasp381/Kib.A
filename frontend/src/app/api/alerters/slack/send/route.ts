// app/api/alerters/slack/route.ts
import { NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

export async function POST(req: Request) {
  const body = await req.json(); // Read JSON body
  const { name, token, message} = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  // get the channel ID from the name
  let client;
  try {
    client = new WebClient(token);

  }catch (error) {
    console.error("Error creating Slack client:", error);
    return NextResponse.json({ error: "Failed to create Slack client" }, { status: 500 });
  }
    // Fetch the Slack channel information
    const conversationsList = await client.conversations.list();
    const channel = conversationsList.channels?.find((channel) => channel.name === name);
  if (!channel) {
    return NextResponse.json({ error: `Channel "${name}" not found` }, { status: 404 });
  }

  if (!channel.id) {
    return NextResponse.json({ error: "Channel ID is missing" }, { status:
  500 });
  }

  try {
    const slackMsg = await client.chat.postMessage({
      channel: channel.id,
      text: message,
    });
    if (!slackMsg.ok) {
      return NextResponse.json({ error: `Failed to send message: ${slackMsg.error}` }, { status: 500 });
    }
    // Return the response with the channel name and message
   
    return NextResponse.json({ success: true, slackMsg }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to send message: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
