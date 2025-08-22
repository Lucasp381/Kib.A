import { NextResponse } from "next/server";
import { indexExists, createIndex } from "@/lib/elasticsearch";
const KIBALERT_INDEX_PREFIX = process.env.KIBALERT_INDEX_PREFIX || "kiba";
export async function GET() {
    // Création de l'index kib.a si nécessaire
    const indexList = ['variables', 'alerters', 'settings', 'history'];
    for (const index of indexList) {
      const indexName = `${KIBALERT_INDEX_PREFIX}-${index}`;
      if (await indexExists(indexName)) {
        console.log(`Index ${indexName} already exists.`);
      } else {
        await createIndex(indexName);
      }
    }
    // Suppression de l'index kib.a si nécessaire
    
    return new NextResponse('Indexation terminée');
}