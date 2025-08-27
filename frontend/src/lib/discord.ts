
export async function sendDiscordMessage(message: string) {
    const res = await fetch("/api/backend/alerters/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
    });

    const data = await res.json();

    if (!res.ok) {
        console.error("Failed to send message:", data.error);
        return;
    }

    console.log("Message sent successfully:", data);
}
