import { Client, estypes } from '@elastic/elasticsearch';

const esClientConfiguration: {
  node: string;
  auth: { apiKey: string };
  tls: { rejectUnauthorized: boolean };
  caFingerprint?: string;
} = {
  node: process.env.ELASTIC_URL || 'http://127.0.0.1:9200',
  auth: {
    apiKey: process.env.ELASTIC_API_KEY || ''
  },
  tls: {
    rejectUnauthorized: process.env.ELASTIC_TLS_REJECT_UNAUTHORIZED === 'true'
  }
};
if (process.env.ELASTIC_CA_FINGERPRINT && process.env.ELASTIC_CA_FINGERPRINT.length > 0) {
  esClientConfiguration.caFingerprint = process.env.ELASTIC_CA_FINGERPRINT;
}

export const esClient = new Client(esClientConfiguration);

export async function checkESConnection() {
  try {
    const response = await esClient.info();
    console.log('Elasticsearch connection successful:', response);
    return true;
  } catch (error) {
    console.error('Elasticsearch connection failed:', error);
    return false;
  }
}

export async function createIndex(indexName: string) {
  try {
    const response = await esClient.indices.create({ index: indexName });
    console.log(`Index ${indexName} created successfully:`, response);

    return true;
  } catch (error) {

    console.error(`Failed to create index:`, error);
    return false;

  }
}

export async function indexExists(indexName: string) {
  try {
    const response = await esClient.indices.exists({ index: indexName });
    console.log(`Index ${indexName} exists:`, response);
    return response;
  } catch (error) {
    console.error(`Failed to check if index ${indexName} exists:`, error);
    return false;
  }
}

export async function search(
  indexName: string,
  query: object,      // on utilise object pour manipuler plus facilement la query
  page: number = 1,   // page actuelle, par défaut 1
  pageSize: number = 10 // nombre de résultats par page
) {
  try {
    const response = await esClient.search({
      index: indexName,
      from: (page - 1) * pageSize, // calcul de l'offset
      size: pageSize,              // nombre de résultats à retourner
      body: query,
    });

    console.log(`Search results for ${indexName} (page ${page}):`, response);
    return response;
  } catch (error) {
    console.error(`Failed to perform search in ${indexName}:`, error);
    return null;
  }
}
export async function deleteIndex(indexName: string) {
  try {
    const response = await esClient.indices.delete({ index: indexName });
    console.log(`Index ${indexName} deleted successfully:`, response);
    return true;
  } catch (error) {

    console.error(`Failed to delete index ${indexName}:`, error);
    return false;
  }
}

export async function indexDocument(indexName: string, document: string) {
  try {
    if (typeof document !== 'object' || document === null) {
      throw new Error('Document must be a non-null object');
    }
    const response = await esClient.index({
      index: indexName,
      body: document,
    });
    console.log(`Document indexed successfully in ${indexName}:`, response);
    return true;
  } catch (error) {
    console.error(`Failed to index document in ${indexName}:`, error);
    return false;
  }
}

export async function getKeyValue(indexName: string, id: string) {
  try {
    const response = await esClient.get({
      index: indexName,
      id: id,
    });
    console.log(`Key retrieved successfully from ${indexName}:`, response);
    const data = {
      id: response._id,
      data: (response._source as Record<string, string>)?.data,
      timestamp: (response._source as Record<string, string>)['@timestamp']
    };
    return data;
  } catch (error) {
    console.error(`Failed to retrieve key from ${indexName}:`, error);
    return null;
  }
}

export async function setKeyValue(indexName: string, id: string, value: string) {
  try {
    // Toujours indexer un objet avec les champs data et @timestamp
    const doc: { data: string; "@timestamp"?: string } =
      typeof value === "object" && value !== null ? value : { data: value };
    // Ajoute le timestamp automatiquement
    doc["@timestamp"] = new Date().toISOString();
    const response = await esClient.index({
      index: indexName,
      id: id,
      body: doc
    });
    console.log(`Key set successfully in ${indexName}:`, response);
    return true;
  } catch (error) {
    console.error(`Failed to set key in ${indexName}:`, error);
    return false;
  }
}