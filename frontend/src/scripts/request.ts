const TIMEOUT = 5000;

import { Render } from '@/config';
import {
    RenderReq,
    ReqRespond,
    QueryReq,
    QueryRes,
    ServerStatus,
} from '@/types'
import axios from 'axios'
const AXIOS = axios.create();
import axiosRetry from 'axios-retry';

axiosRetry(AXIOS, { retries: 3, retryDelay: () => 1000, retryCondition: () => true });

async function requestInfo(uuid: string): Promise<QueryRes> {
    const req: QueryReq = {
        uuid: uuid,
    }
    return (await AXIOS.post("/query", req, {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: TIMEOUT
    })).data;
}

async function requestRender(req: RenderReq): Promise<ReqRespond> {
    return (await AXIOS.post("/req", req, {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: TIMEOUT
    })).data;
}

async function requestRating(rating: number) {
    return await AXIOS.post("/rating", { rating: rating }, { timeout: TIMEOUT })
}

async function serverInfo(): Promise<Render> {
    return (await AXIOS.get("/serverInfo", { timeout: TIMEOUT })).data as Render;
}

async function serverStatus(): Promise<ServerStatus> {
    return (await AXIOS.get("/serverStatus", { timeout: TIMEOUT })).data as ServerStatus;
}

export {
    requestInfo,
    requestRender,
    serverInfo,
    serverStatus,
    requestRating,
}