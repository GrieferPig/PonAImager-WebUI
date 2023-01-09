// surprisingly this code works on first try gj to me

export { }

const express = require("express");
const path = require('path');
const cp = require('child_process');
const os = require('os');
const fs = require('fs');

let crypto = require("crypto");

const PYSCRIPT_PATH = path.join(__dirname, "..", "src", "pytorch.py");
const PORT = 80;

// const EXPIRETIME = 30*60000;
const EXPIRETIME = 100000;

const MEM_OPT = true;

const daemon = cp.spawn("python", [PYSCRIPT_PATH, "--listen"]);

let daemonInit = false;

daemon.stdout.on('data', (data: Buffer) => {
    console.log("stdout: " + data.toString());
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
app.use("/img", express.static(path.join(__dirname, "..", "temp")));

app.post('/api', (req, res) => {
    res.send('Got a POST request')
})

app.listen(PORT, () => {
    console.log(`Hey yo im on http://127.0.0.1:${PORT}!`);
});

let taskList = new Map<String, RenderStat>();
let pendingUUID: String[] = [];
let renderingUUID: string = "";

function addTask(req: RenderReq): string {
    let _uuid = crypto.randomUUID();
    taskList.set(_uuid, {
        status: "Pending",
        detail: "",
        currentIter: -1,
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
            if (err) console.log(err);
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

interface RenderReq {
    type: "img2img" | "txt2img",
    prompt: string,
    negPrompt: string,
    scale: number,
    steps: number,
    height: number,
    width: number,
    sampler: "DDIM" | "Euler",
    seed: number,
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
}


// function logger() {
//     setTimeout(() => {
//         console.log(taskList)
//         logger()
//     }, 10000)
// }
// logger();

// addTask({ type: "", prompt: "pony", scale: 7.5, steps: 30, height: 512, width: 512, sampler: "DDIM", seed: -1, reqTime: new Date().getTime() } as RenderReq)
addTask({
    type: "txt2img",
    prompt: "pony",
    negPrompt: "3d sfm",
    scale: 7,
    steps: 35,
    height: 384,
    width: 512,
    sampler: "Euler",
    seed: 127,
})
