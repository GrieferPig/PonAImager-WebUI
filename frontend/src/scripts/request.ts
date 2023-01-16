import {
    RenderReq,
    ReqRespond,
    QueryReq,
    QueryRes,
} from '@/types'
import axios from 'axios'

async function requestInfo(uuid: string): Promise<QueryRes> {
    const req: QueryReq = {
        uuid: uuid,
    }
    return (await axios.post("/query", req, {
        headers: {
            'Content-Type': 'application/json'
        },
    })).data;
}

async function requestRender(req: RenderReq): Promise<ReqRespond> {
    return (await axios.post("/req", req, {
        headers: {
            'Content-Type': 'application/json'
        },
    })).data;
}

async function howManyRequestsAreThere(): Promise<number> {
    return (await axios.get("/howManyRequestsAreThere")).data as number;
}

export {
    requestInfo,
    requestRender,
    howManyRequestsAreThere,
}