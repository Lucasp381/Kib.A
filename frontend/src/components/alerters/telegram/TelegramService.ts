import { TelegramAlerter } from "@/types/alerters";
import { toast } from "sonner";

export async function saveTelegramAlerter(
    data: TelegramAlerter,
    setAlerters: React.Dispatch<React.SetStateAction<TelegramAlerter[]>>,
    setEditAlerter?: React.Dispatch<React.SetStateAction<TelegramAlerter | null>>

) {

    if (!data.name || !data.config.token || !data.config.chatId) {
        data.enabled = false; // Disable if required fields are missing
    }

    await fetch("/api/alerters", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...data,
            updated_at: new Date().toISOString(),
            created_at: data.created_at || new Date().toISOString(),
        }),
    })

        .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            res.json().then((responseData) => {
                if (!data.id) {
                    data.id = responseData.response._id; // Assuming the response contains the new ID
                    if (setAlerters) {
                        if (setAlerters) {
                            if (setAlerters) {
                                setAlerters((prevAlerters) => {
                                    const safePrev = Array.isArray(prevAlerters) ? prevAlerters : [];
                                    return [...safePrev, data];
                                });
                            }
                        }
                    }
                    if (setEditAlerter) {
                        setEditAlerter(data);
                    }
                    return responseData
                } else {
                     setAlerters((prevAlerters) => {
                        const safePrev = Array.isArray(prevAlerters) ? prevAlerters : [];
                        return safePrev.map((alerter) => alerter.id === data.id ? data : alerter);
                    });
                    toast.success("Alerter updated successfully!");
                    return responseData
                }

            });

        })
        .catch((err) => {
            console.error("Erreur lors de la mise à jour du Slack alerter :", err);
        })
        .finally(() => {
        })
        ;

}

export async function deleteTelegramAlerter(id: string, alerters: TelegramAlerter[], setAlerters: React.Dispatch<React.SetStateAction<TelegramAlerter[]>>, setEditAlerter?: React.Dispatch<React.SetStateAction<TelegramAlerter | null>>) {
    if (!id) {
        return;
    }
    if (!window.confirm("Are you sure you want to delete this Telegram alerter?")) {
        return;
    }
    fetch(`/api/alerters?id=${id}`, {
        method: "DELETE",
    })
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            toast.success("Alerter deleted successfully!");
            setAlerters((prevAlerters) => prevAlerters.filter((alerter) => alerter.id !== id));
            if (setEditAlerter) {
                setEditAlerter(alerters.length > 0 ? alerters[0] : null);
            }
            return res.json();
        })

        .catch((err) => {
            console.error("Erreur lors de la suppression du Telegram alerter :", err);
        });
}
