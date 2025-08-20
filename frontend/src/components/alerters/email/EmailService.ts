import { EmailAlerter, Alerter } from "@/types/alerters";
import { toast } from "sonner";
import { encrypt, decrypt } from "@/lib/crypt";
export function sendEmailTestMessage(smtp_server: string, port: number, username: string, password: string, from_address: string, to_addresses: string, cc_addresses: string, subject: string, message: string) {
    
    return fetch("/api/alerters/email/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            smtp_server,
            port,
            username,
            password: password,
            from_address,
            to_addresses : to_addresses.split(",").map((addr: string) => addr.trim()),
            cc_addresses: cc_addresses ? cc_addresses.split(",").map((addr: string) => addr.trim()) : undefined,
            subject: "Test Message from KibAlbert",
        
            message,
        }),
    })
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .catch((err) => {
            console.error("Erreur lors de l'envoi du test email :", err);
            throw err;
        });

}


export async function checkEmailAlerterExists(name: string): Promise<boolean> {
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


export async function saveEmailAlerter(
    data: EmailAlerter,
    setAlerters: React.Dispatch<React.SetStateAction<EmailAlerter[]>>,
    setEditAlerter?: React.Dispatch<React.SetStateAction<EmailAlerter | null>>

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
            console.error("Erreur lors de la mise à jour du Email alerter :", err);
        })
         .finally(() => {
        })
        ;

}

export async function deleteEmailAlerter(id: string, alerters: EmailAlerter[], setAlerters: React.Dispatch<React.SetStateAction<EmailAlerter[]>>, setEditAlerter?: React.Dispatch<React.SetStateAction<EmailAlerter | null>>) {
        if (!id) {
            return;
        }
        if (!window.confirm("Are you sure you want to delete this Email alerter?")) {
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
                console.error("Erreur lors de la suppression du Email alerter :", err);
            });
    }
