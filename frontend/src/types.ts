interface RenderReq {
    type: "img2img" | "txt2img", // img2img no impl yet
    prompt: string,
    negPrompt: string,
    scale: number,
    steps: number,
    height: number,
    width: number,
    sampler: "DDIM" | "Euler", // impl more sampler
    seed: number,
    srcImg: string, // no impl yet
    watermark: boolean, // no impl yet
}

interface RenderStat {
    status: "Finished" | "Pending" | "Error" | "Rendering",
    detail: string,
    currentIter: number,
    iterSpeed: string, // no impl yet
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
    detail: string,
}

interface QueryReq {
    uuid: string,
}

interface QueryRes {
    status: "yay" | "neigh" | "wot",
    renderStat: RenderStat | undefined,
}

type RenderStatus = ("idle" | "pending" | "rendering" | "done" | "error");

export type {
    RenderReq,
    RenderStat,
    ReqRespond,
    QueryReq,
    QueryRes,
    RenderStatus,
}

