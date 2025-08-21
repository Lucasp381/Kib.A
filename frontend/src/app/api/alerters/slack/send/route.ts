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
  

  try {

     const response = await fetch(process.env.BACKEND_URL + `/alerters/slack/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        target: name,
        message,
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
