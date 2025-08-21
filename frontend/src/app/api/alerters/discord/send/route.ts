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

    const response = await fetch(process.env.BACKEND_URL + `/alerters/discord/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, token, message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Discord API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to send message: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
