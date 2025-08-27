import axios from 'axios';

const esConfig = {
    baseURL: process.env.ELASTIC_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
};

const axiosEsClient = axios.create(esConfig);

const kibanaConfig = {
    baseURL: process.env.KIBANA_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
};

const axiosKibanaClient = axios.create(kibanaConfig);

const backendConfig = {
    baseURL: "http://localhost:3001",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
};

const axiosBackendClient = axios.create(backendConfig);

export { axiosEsClient, axiosKibanaClient, axiosBackendClient };