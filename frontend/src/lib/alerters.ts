import { Alerter } from "@/types/alerters";
import axios from "axios";

export async function SetAndGetAlerters(type: string, setAlerters: React.Dispatch<React.SetStateAction<Alerter[]>>) {
    await axios.get(`/api/backend/alerters?type=${type}`)
        .then((res) => {
            setAlerters(res.data as Alerter[]);
            return res.data;
        })
        .catch((err) => {
            console.error("Erreur lors de la récupération des Discord alerters :", err);
        });
}
export async function saveAlerter(
    data: Alerter,

) {
    await axios.post("/api/backend/alerters", data);

}

