interface RenderReq {
    type: "img2img" | "txt2img", // img2img no impl yet
    prompt: string,
    negPrompt: string,
    scale: number,
    steps: number,
    height: number,
    width: number,
    seed: number,
    srcImg: string, // TODO: impl
    watermark: boolean, // no impl yet
}

interface RenderStat {
    status: "Finished" | "Pending" | "Error" | "Rendering",
    detail: string,
    currentIter: number,
    iterSpeed: string, // TODO: impl
    estiTime: number, // no impl yet
    uuid: string,
    filePath: string,
    expireTime: number,
    reqTime: number,
    finishTime: number,
    origReq: RenderReq,
    reqNoProcessingNow: number,
}

interface ReqRespond {
    status: "yay" | "neigh", // TRADITION
    reqNo: number
    detail: string,
}

interface QueryReq {
    uuid: string,
}

interface QueryRes {
    status: "yay" | "neigh" | "wot",
    renderStat: RenderStat | undefined,
}

import { ServerConfig, Render } from "./config";

type ServerInfo = Render;

type RenderStatus = ("idle" | "reqsent" | "pending" | "rendering" | "done" | "error");

interface ServerStatus {
    pendingRequests: number,
    doneRequests: number,
    averageIterSpeed: number,
}

export type {
    RenderReq,
    RenderStat,
    ReqRespond,
    QueryReq,
    QueryRes,
    RenderStatus,
    ServerConfig,
    ServerInfo,
    ServerStatus,
}