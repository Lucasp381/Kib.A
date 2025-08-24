// app/api/alerters/slack/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json(); // Read JSON body
  const { token, chatId, message} = body;

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }
  // get the channel ID from the name
  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  try {

     const response = await fetch(process.env.BACKEND_URL + `/alerters/telegram/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        chatId,
        message
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
