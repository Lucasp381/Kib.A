// app/api/alerters/discord/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json(); // Read JSON body
  const { id, token, message } = body;
  // to do : use Alerter informations to authenticate and send message
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  try {
    const discordRes = await fetch(
      `https://discord.com/api/v10/channels/${id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      }
    );

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      return NextResponse.json(
        { error: `Discord API error: ${errorText}` },
        { status: discordRes.status }
      );
    }

    const data = await discordRes.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to send message: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
