import { DiscordAlerter, Alerter } from "@/types/alerters";
import { toast } from "sonner";
import { encrypt, decrypt } from "@/lib/crypt";



export async function checkDiscordAlerterExists(name: string): Promise<boolean> {
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


export async function saveDiscordAlerter(
    data: DiscordAlerter,
    setAlerters: React.Dispatch<React.SetStateAction<DiscordAlerter[]>>,
    setEditAlerter?: React.Dispatch<React.SetStateAction<DiscordAlerter | null>>

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
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            res.json().then((responseData) => {
                if (!data.id) {
                    data.id = responseData.response._id; // Assuming the response contains the new ID
                    console.log(data);
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
            console.error("Erreur lors de la mise à jour du Discord alerter :", err);
        })
         .finally(() => {
        })
        ;

}

export async  function deleteDiscordAlerter(id: string, alerters : DiscordAlerter[], setAlerters: React.Dispatch<React.SetStateAction<DiscordAlerter[]>>, setEditAlerter?: React.Dispatch<React.SetStateAction<DiscordAlerter | null>>) {
        if (!id) {
            return;
        }
        if (!window.confirm("Are you sure you want to delete this Discord alerter?")) {
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
                console.error("Erreur lors de la suppression du Discord alerter :", err);
            });
    }
