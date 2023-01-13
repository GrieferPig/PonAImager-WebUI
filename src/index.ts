// surprisingly this code works on first try gj to me

import {
    RenderReq,
    RenderStat,
    ReqRespond,
    QueryReq,
    QueryRes,
} from '../frontend/src/types'

const express = require("express");
const path = require('path');
const cp = require('child_process');
const os = require('os');
const fs = require('fs');
const bodyParser = require('body-parser');
let crypto = require("crypto");

const PYSCRIPT_PATH = path.join(__dirname, "..", "src", "pytorch.py");
const PORT = 80;

const EXPIRETIME = 30 * 60000;

const MEM_OPT = true;

const MAX_STEPS = 60;
const MAX_HEIGHT = 512;
const MAX_WIDTH = 512;
const MIN_HEIGHT = 128;
const MIN_WIDTH = 128;

const daemon = cp.spawn("python", [PYSCRIPT_PATH, "--listen"]);

// used to check req
const demoReq: RenderReq = {
    type: "txt2img",
    prompt: "pony",
    negPrompt: "3d sfm",
    scale: 7,
    steps: 35,
    height: 384,
    width: 512,
    sampler: "Euler",
    seed: 127,
    srcImg: "",
};

let daemonInit = false;

let taskList = new Map<String, RenderStat>();
let pendingUUID: String[] = [];
let renderingUUID: string = "";

daemon.stdout.on('data', (data: Buffer) => {
    // console.log("stdout: " + data.toString());
    if (data.toString() === "ready" + os.EOL) {
        if (!daemonInit) {
            daemonInit = true;
        } else {
            finishTask();
            startNextTask();
        }
    } else {
        updateRenderingTask(data);
    }
});

daemon.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

daemon.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    console.log("Server halt on fatal error");
    process.exit(code);
});

const app = express();

app.use("/", express.static(path.join(__dirname, "..", "frontend", "dist")));
app.use("/temp", express.static(path.join(__dirname, "..", "temp")));

app.use(bodyParser.json());

app.post('/req', (req, res) => {
    // console.log(req.body);
    let reqRes: ReqRespond = { status: "yay", detail: "" };
    let checkRes = checkReq(req.body);
    // console.log(checkRes)
    if (checkRes !== "") {
        // console.log(checkRes)
        reqRes.status = "neigh";
        reqRes.detail = checkRes;
    } else {
        reqRes.detail = addTask(req.body);
    }
    res.send(reqRes);
})

app.post('/query', (req, res) => {
    // console.log(req.body);
    let queryRes: QueryRes = {
        status: "yay",
        renderStat: undefined,
    };
    if (typeof (req.body as QueryReq).uuid !== "string") {
        queryRes.status = "wot";
        res.send(queryRes);
        return;
    }
    let stat = taskList.get((req.body as QueryReq).uuid);
    if (typeof stat === 'undefined') {
        queryRes.status = "neigh";
        res.send(queryRes);
        return;
    } else {
        queryRes.renderStat = stat;
        res.send(queryRes);
        return;
    }
});

app.get('/howManyRequestsAreThere', (req, res) => {
    res.send(pendingUUID.length);
});

app.get("/student", function (req, res) {
    res.send("student");
});

app.listen(PORT, () => {
    console.log(`Hey yo im on http://127.0.0.1:${PORT} !`);
});

function addTask(req: RenderReq): string {
    let _uuid = crypto.randomUUID();
    taskList.set(_uuid, {
        status: "Pending",
        detail: "",
        currentIter: 0,
        iterSpeed: "",
        estiTime: 0,
        uuid: _uuid,
        filePath: "",
        expireTime: 0,
        reqTime: new Date().getTime(),
        finishTime: 0,
        origReq: req,
    } as RenderStat);
    pendingUUID.push(_uuid)
    startNextTask();
    return _uuid;
}

function startNextTask() {
    if (pendingUUID.length !== 0) {
        if (renderingUUID === "") {
            renderingUUID = pendingUUID.shift() as string;
            let _task: RenderStat = taskList.get(renderingUUID) as RenderStat;
            let _args: string = concatArg(_task);
            console.log(`Launching task ${renderingUUID} with args ${_args}`)
            daemon.stdin.write(_args)
        }
    }
}

function finishTask() {
    let _task: RenderStat = taskList.get(renderingUUID) as RenderStat;
    let _finishTime = new Date().getTime();
    _task.status = "Finished";
    _task.finishTime = _finishTime;
    _task.filePath = `/temp/${_task.uuid + ".png"}`;
    _task.expireTime = _finishTime + EXPIRETIME;
    taskList.set(renderingUUID, _task);
    let _UUIDcopy = renderingUUID + ""; // deep copy
    setTimeout(() => {
        taskList.delete(_UUIDcopy);
        let _path = path.join(__dirname, "..", "temp", _UUIDcopy + ".png");
        fs.unlink(_path, (err) => {
            //ignore this
            // if (err) console.log(err);
        });
    }, EXPIRETIME)
    renderingUUID = "";
}

function updateRenderingTask(proc_output: Buffer) {
    let _task: RenderStat = taskList.get(renderingUUID) as RenderStat;
    _task.currentIter++;
    _task.status = "Rendering";
    let _output = proc_output.toString();
    // TODO: impl iter speed & esti time
    taskList.set(renderingUUID, _task);
}

function concatArg(req: RenderStat): string {
    let _arg = `--scale ${req.origReq.scale} --steps ${req.origReq.steps} --height ${req.origReq.height} --width ${req.origReq.width} --sampler ${req.origReq.sampler} --seed ${req.origReq.seed} --outname ${req.uuid} ${req.origReq.prompt} --negative ${req.origReq.negPrompt}`;
    if (!MEM_OPT) {
        _arg += " --noopt";
    }
    _arg += os.EOL;
    return _arg;
}

// TODO: impl a similar checker in the frontend to 
// reduce potential request
function checkReq(req: RenderReq): string {
    for (let key in demoReq) {
        if (!req.hasOwnProperty(key)) {
            return "Malformed request"
        }
    }
    if (req.type !== "txt2img") {
        return "Only txt2img render type is supported";
    }
    if (req.prompt.split(" ").length > 77) {
        return "Prompt too long";
    }
    if (req.negPrompt.split(" ").length > 77) {
        return "Negative prompt too long";
    }
    if (req.scale < 0) {
        return "Scale must be positive";
    }
    if (req.steps < 1 && req.steps > MAX_STEPS) {
        return `Steps out of range (1-${MAX_STEPS})`;
    }
    if (req.height < MIN_HEIGHT && req.height > MAX_HEIGHT) {
        return `Height out of range (${MIN_HEIGHT}-${MAX_HEIGHT})`;
    }
    if (req.width < MIN_WIDTH && req.width > MAX_WIDTH) {
        return `Width out of range (${MIN_WIDTH}-${MAX_WIDTH})`;
    }
    if ((req.width % 32 !== 0) && (req.height % 32 !== 0)) {
        return "Height/Width is not multiplies of 32"
    }
    return "";
}

// function logger() {
//     setTimeout(() => {
//         console.log(taskList)
//         logger()
//     }, 10000)
// }
// logger();

// addTask({
//     type: "txt2img",
//     prompt: "pony",
//     negPrompt: "3d sfm",
//     scale: 7,
//     steps: 35,
//     height: 384,
//     width: 512,
//     sampler: "Euler",
//     seed: 127,
// })
