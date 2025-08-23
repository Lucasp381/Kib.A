import { TeamsAlerter } from "@/types/alerters";
import { toast } from "sonner";



export async function checkTeamsAlerterExists(name: string): Promise<boolean> {
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


export async function saveTeamsAlerter(
    data: TeamsAlerter,
    setAlerters: React.Dispatch<React.SetStateAction<TeamsAlerter[]>>,
    setEditAlerter?: React.Dispatch<React.SetStateAction<TeamsAlerter | null>>

) {


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
        .then(async (res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            await res.json().then((responseData) => {
                if (!data.id) {
                    data.id = responseData.response._id; // Assuming the response contains the new ID
                    console.log(data);
                    if (setAlerters) {
                        if (setAlerters) {
                            setAlerters((prevAlerters) => {
                                const safePrev = Array.isArray(prevAlerters) ? prevAlerters : [];
                                return [...safePrev, data];
                            });
                        }
                    }
                    if (setEditAlerter) {
                        setEditAlerter(data);
                    }
                    toast.success("Teams alerter duplicated successfully!");
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
            console.error("Erreur lors de la mise à jour du Teams alerter :", err);
        })
        .finally(() => {
        })
        ;

}

export async function deleteTeamsAlerter(id: string, alerters: TeamsAlerter[], setAlerters: React.Dispatch<React.SetStateAction<TeamsAlerter[]>>, setEditAlerter?: React.Dispatch<React.SetStateAction<TeamsAlerter | null>>) {
    if (!id) {
        return;
    }
    if (!window.confirm("Are you sure you want to delete this Teams alerter?")) {
        return;
    }
    await fetch(`/api/alerters?id=${id}`, {
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
            console.error("Erreur lors de la suppression du Teams alerter :", err);
        });
}
