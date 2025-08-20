import { NextRequest, NextResponse } from "next/server";
import { indexExists, indexDocument, createIndex, deleteIndex } from "@/lib/elasticsearch";
const KIBALERT_INDEX_PREFIX = process.env.KIBALERT_INDEX_PREFIX || "kibalert";
export async function GET(req: NextRequest) {
    // Création de l'index kibalert si nécessaire
    const indexList = ['variables', 'alerters', 'settings', 'history'];
    for (const index of indexList) {
      const indexName = `${KIBALERT_INDEX_PREFIX}-${index}`;
      if (await indexExists(indexName)) {
        console.log('Index kibalert already exists.');
      } else {
        await createIndex(indexName);
      }
    }
    // Suppression de l'index kibalert si nécessaire
    
    return new NextResponse('Indexation terminée');
}