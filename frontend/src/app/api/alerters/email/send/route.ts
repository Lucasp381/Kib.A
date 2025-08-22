// app/api/alerters/email/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json(); // Read JSON body
  const {  smtp_server, port, username, password, from_address, to_addresses, cc_addresses, subject, message} = body;

  if (!smtp_server || !port || !username || !password || !to_addresses) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  try {

   const response = await fetch( process.env.BACKEND_URL + "/alerters/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        smtp_server,
        port,
        username,
        password,
        from_address,
        to_addresses,
        cc_addresses,
        subject,
        message
      })
    });
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to send email: ${response.statusText}` }, { status: 500 });
    }
  return NextResponse.json({ success: true  });
} catch (error) {
  console.error("Erreur envoi email:", error);
  return NextResponse.json({ success: false, error: error }, { status: 500 });
}
}
