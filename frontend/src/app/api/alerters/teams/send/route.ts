// app/api/alerters/slack/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json(); // Read JSON body
  const { webhook, message, payload} = body;

  if (!message && !payload) {
    return NextResponse.json({ error: "message or payload is required" }, { status: 400 });
  }
  if (!webhook) {
    return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 });
  }

  // get the channel ID from the name
  

  try {

     const response = await fetch(process.env.BACKEND_URL + `/alerters/teams/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhook,
        message,
        payload,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to send message: ${response.statusText}` }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to send message: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
