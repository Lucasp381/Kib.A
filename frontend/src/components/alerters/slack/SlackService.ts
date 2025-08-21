import { SlackAlerter } from "@/types/alerters";
import { toast } from "sonner";
import { encrypt, decrypt } from "@/lib/crypt";
// channel:read, chat:write
export function sendSlackTestMessage(token: string, channelname: string, message: string) {
    return fetch(`/api/alerters/slack/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",

        },
        body: JSON.stringify({ name: channelname, token: token, message: message }),
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Slack API error: ${res.statusText}`);
            }
            return res.json();
        })
        .then((data) => {
            console.log("Test message sent successfully:", data);
            return data;
        })
        .catch((error) => {
            console.error("Error sending test message:", error);
            throw error;
        });
}


export async function checkSlackAlerterExists(name: string): Promise<boolean> {
    return fetch(`/api/alerters?name=${name}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to check alerter existence: ${res.statusText}`);
            }
            return res.json();
        })
        .then((data) => data.length > 0)
        .catch((error) => {
            console.error(error);
            return false;
        });
}


export async function saveSlackAlerter(
    data: SlackAlerter,
    setAlerters: React.Dispatch<React.SetStateAction<SlackAlerter[]>>,
    setEditAlerter?: React.Dispatch<React.SetStateAction<SlackAlerter | null>>

) {

    if (!data.name || !data.config.token || !data.config.channelId || !data.config.channelName) {
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
                        setAlerters((prevAlerters) => [...prevAlerters, data]);
                    }
                    if (setEditAlerter) {
                        setEditAlerter(data);
                    }
                    return responseData
                }else {
                    setAlerters((prevAlerters) => prevAlerters.map((alerter) => alerter.id === data.id ? data : alerter));
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

export async  function deleteSlackAlerter(id: string, alerters: SlackAlerter[], setAlerters: React.Dispatch<React.SetStateAction<SlackAlerter[]>>, setEditAlerter?: React.Dispatch<React.SetStateAction<SlackAlerter | null>>) {
        if (!id) {
            return;
        }
        if (!window.confirm("Are you sure you want to delete this Slack alerter?")) {
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
                console.error("Erreur lors de la suppression du Slack alerter :", err);
            });
    }
