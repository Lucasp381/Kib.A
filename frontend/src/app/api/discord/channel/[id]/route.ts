import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } 
  ) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'Missing channelId parameter' }, { status: 400 });
    }

    const token = req.headers.get("Authorization"); 
    if (!id) {
        return NextResponse.json({ error: 'Missing channelId parameter' }, { status: 400 });
    }

    try {
        // Fetch the Discord channel information
        const discordRes = await fetch(`https://discord.com/api/v10/channels/${id}`, {
            headers: {
                Authorization: `${token}`,
            },
        });

        if (!discordRes.ok) {
            const errorText = await discordRes.text();
            return NextResponse.json(
                { error: `Discord API error: ${errorText}` },
                { status: discordRes.status }
            );
        }

        const data = await discordRes.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { error: `Failed to fetch channel information: ${err instanceof Error ? err.message : "Unknown error"}` },
            { status: 500 }
        );
    }
}