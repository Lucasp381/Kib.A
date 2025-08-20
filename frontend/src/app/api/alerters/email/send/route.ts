// app/api/alerters/email/route.ts
import { NextResponse } from "next/server";
import  nodemailer from "nodemailer"; 

export async function POST(req: Request) {
  const body = await req.json(); // Read JSON body
  const {  smtp_server, port, username, password, from_address, to_addresses, cc_addresses, message} = body;

console.log("Sending email with body:", password);
  if (!smtp_server || !port || !username || !password || !to_addresses) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  try {
  // get the channel ID from the name
  const transporter = nodemailer.createTransport({
    host: smtp_server,
    port: Number(port),
    secure: true, // true si port 465
    auth: {
      user: username,
      pass: password,
    },
  });

  const mailOptions = {
    from: from_address,
    to : to_addresses,
    subject : "Test Message from KibAlbert",
    text : message,
    cc: cc_addresses ? cc_addresses.join(",") : undefined,

  };
  console.log("mailOptions", mailOptions);

  const info = await transporter.sendMail(mailOptions);

  return NextResponse.json({ success: true, info });
} catch (error) {
  console.error("Erreur envoi email:", error);
  return NextResponse.json({ success: false, error: error }, { status: 500 });
}
}
