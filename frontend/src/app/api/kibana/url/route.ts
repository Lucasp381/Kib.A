import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ url: process.env.PUBLIC_KIBANA_URL || process.env.KIBANA_URL });
}