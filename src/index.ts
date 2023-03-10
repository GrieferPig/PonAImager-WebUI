// surprisingly this code works on first try gj to me

// custom types
import {
    RenderReq,
    RenderStat,
    ReqRespond,
    QueryReq,
    QueryRes,
    ServerConfig,
    ServerInfo,
    ServerStatus,
} from '../frontend/src/types'

import * as express from 'express'
import * as cp from 'child_process'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import * as crypto from 'crypto'
import * as log4js from 'log4js'

import * as bodyParser from 'body-parser'
import * as compression from 'compression'
const helmet = require('helmet');

import * as DEFAULT_CONFIG from './defaults.json'
import { merger } from './merger'
import { createRequire } from 'module'

// define paths
const ROOT_PATH = path.join(__dirname, "..", "..");
const TEMP_PATH = path.join(ROOT_PATH, "temp");
const WEBSITE_ROOT_PATH = path.join(ROOT_PATH, "frontend", "dist");
const WEBSITE_ASSET_PATH = path.join(WEBSITE_ROOT_PATH, "assets");

const PYSCRIPT_PATH = path.join(ROOT_PATH, "src", "pytorch.py");
const CONFIG_PATH = path.join(ROOT_PATH, "config.json");

// setup logger
let log = log4js.getLogger("main");
log.level = "all";

let conf: ServerConfig;

// read config
if (fs.existsSync(CONFIG_PATH)) {
    const _conf = fs.readFileSync(CONFIG_PATH).toString();
    conf = JSON.parse(_conf);
    if (typeof conf === 'undefined') {
        log.warn("Cannot read config, using defaults instead");
        conf = DEFAULT_CONFIG;
    }
    conf = merger(DEFAULT_CONFIG, conf) as unknown as ServerConfig;
    log.info("Config loaded");
} else {
    log.warn("Config not found, using defaults instead");
    conf = DEFAULT_CONFIG;
}

const HTTP_PORT = conf.web['http-port'];
const STRICT = conf.web.https.strict;

// remember to convert to millseconds
const EXPIRETIME = conf.render['image-expire-time'] * 1000 * 60;

// maxs and mins
const MAX_STEPS = conf.render.maximum.steps;
const MIN_STEPS = conf.render.minimum.steps;
const MAX_HEIGHT = conf.render.maximum.height;
const MIN_HEIGHT = conf.render.minimum.height;
const MAX_WIDTH = conf.render.maximum.width;
const MIN_WIDTH = conf.render.minimum.width;
const MAX_SCALE = conf.render.maximum.scale;
const MIN_SCALE = conf.render.minimum.scale;
const MAX_TOKEN_LENGTH = conf.render.maximum['token-length'];

// used to check req
const demoReq: RenderReq = {
    type: "txt2img",
    prompt: "pony",
    negPrompt: "3d sfm",
    scale: 7,
    steps: 35,
    height: 384,
    width: 512,
    seed: 127,
    srcImg: "",
    watermark: true,
};

function genLaunchArg(optims: typeof conf.render.optimizations, device: string, modelId: string, revision: string, disableChecker: boolean, downloadProxy: string): string[] {
    let args: string[] = ["--listen"];
    if (optims['attention-slicing']) {
        args.push("--oa");
    }
    if (optims['sequential-cpu-offload']) {
        args.push("--os");
    }
    if (optims['vae-slicing']) {
        args.push("--ov");
    }
    if (optims.xformers) {
        args.push("--ox");
    }
    args.push(`--device ${device}`);
    args.push(`--modelId "${modelId}"`);
    args.push(`--revision "${revision}"`);
    if (disableChecker) {
        args.push(`--disableChecker`);
    }
    if (downloadProxy !== "") {
        args.push(`--proxy "${downloadProxy}"`)
    }
    return [PYSCRIPT_PATH, ...args];
}

const daemon = cp.spawn("python",
    genLaunchArg(
        conf.render.optimizations,
        conf.render['render-device'],
        conf.render['model-id'],
        conf.render.revision,
        conf.render['disable-nsfw-checker'],
        conf.render['download-proxy']
    ),
    { shell: true } // python won't pick up the parameters if not in shell
);

let daemonInit = false;

let taskList = new Map<String, RenderStat>();
let pendingUUID: String[] = [];
let renderingUUID = "";
let taskCounter = 0
let renderedTaskCounter = 0;

daemon.stdout.on('data', (data: Buffer) => {
    if (data.toString() === "ready" + os.EOL) {
        if (!daemonInit) {
            daemonInit = true;
            log.info("Python: Ready to generate.")
        } else {
            finishTask();
        }
        startNextTask();
    } else {
        if (daemonInit) {
            updateRenderingTask(data);
        } else {
            log.debug(`Python: ${data.toString()}`)
        }
    }
});

daemon.stderr.on('data', (data) => {
    if (!(data.toString() as string).includes("Fetch"))
        log.error("Stderr from python script: " + os.EOL + data.toString());
});

daemon.on('close', (code) => {
    log.error(`Child process exited with code ${code}`);
    log.error("Server halt on fatal error");
    process.exit(code!);
});

const app = express();

app.use(bodyParser.json());
if (compression) {
    log.info(`Use compression with level ${conf.web.compression.level}`)
    app.use(compression({ level: conf.web.compression.level, memLevel: conf.web.compression.level }));
}
if (STRICT) {
    log.info("Use strict headers")
    app.use(helmet());
}

app.use((err, req, res, next) => {
    log.error(`Server: ${err.stack}`)
    res.status(500).send('Something broke!')
})

app.use("/", express.static(WEBSITE_ROOT_PATH));
app.use("/assets", express.static(WEBSITE_ASSET_PATH));
app.use("/temp", express.static(TEMP_PATH, {
    setHeaders: function (res, path) {
        // download the img instead of showing it
        res.type("application/x-please-download-me")
    }
}));

app.post('/req', (req, res) => {
    let reqRes: ReqRespond = { status: "yay", reqNo: taskCounter + 1, detail: "" };
    let checkRes = checkReq(req.body);
    if (checkRes !== "") {
        reqRes.status = "neigh";
        reqRes.detail = checkRes;
    } else {
        reqRes.detail = addTask(req.body);
    }
    res.send(reqRes);
})

app.post('/query', (req, res) => {
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

app.post('/rating', (req, res) => {
    let _rating = parseInt(req.body.rating)
    if (_rating > 5 && _rating < 1) {
        res.send("Out of range")
        return;
    }
    console.log(req.body)
    updateRating(_rating);
    res.send("")
})

let rating = 0;
let ratingCount = 0;

function updateRating(newRating: number) {
    rating = parseFloat((((rating * ratingCount) + newRating) / (ratingCount + 1)).toFixed(2))
    ratingCount++;
    log.info(`New Rating: ${rating} @ No. ${ratingCount}`)
}

// one-time fetch for clients, consts
app.get('/serverInfo', (req, res) => {
    res.send(conf.render as ServerInfo);
});

// need to update in frontend every second, vars
app.get('/serverStatus', (req, res) => {
    res.send({
        pendingRequests: pendingUUID.length,
        doneRequests: renderedTaskCounter,
        totalRequests: taskCounter,
        averageIterSpeed: averageIterSpeed
    } as ServerStatus);
});

app.listen(HTTP_PORT, () => {
    log.info(`Server started @ http://localhost:${HTTP_PORT}`)
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
        reqNo: taskCounter + 1,
    } as RenderStat);
    pendingUUID.push(_uuid)
    taskCounter++;
    startNextTask();
    return _uuid;
}

let timeElapsed = 0;
let averageIterSpeed = 0;

function startNextTask() {
    timeElapsed = Date.now();
    if (daemonInit && pendingUUID.length !== 0) {
        if (renderingUUID === "") {
            renderingUUID = pendingUUID.shift() as string;
            let _task: RenderStat = taskList.get(renderingUUID) as RenderStat;
            let _args: string = concatArg(_task);
            log.info(`Launching task ${_task.reqNo}: ${renderingUUID} with args ${_args}`)
            daemon.stdin.write(_args)
        }
    }
}

function finishTask() {
    let _task: RenderStat = taskList.get(renderingUUID) as RenderStat;

    // calc time elapsed
    timeElapsed = Date.now() - timeElapsed;
    // convert from ms to s
    timeElapsed = timeElapsed / 1000;

    let _averageIterSpeed = timeElapsed / _task.currentIter
    averageIterSpeed = ((averageIterSpeed * renderedTaskCounter) + _averageIterSpeed) / (renderedTaskCounter + 1)
    // clip to 2 sig digit
    averageIterSpeed = parseFloat(averageIterSpeed.toFixed(2))

    let _finishTime = new Date().getTime();
    _task.status = "Finished";
    _task.finishTime = _finishTime;
    _task.filePath = `/temp/${_task.uuid + ".png"}`;
    _task.expireTime = _finishTime + EXPIRETIME;
    taskList.set(renderingUUID, _task);
    let _UUIDcopy = renderingUUID + ""; // deep copy
    setTimeout(() => {
        taskList.delete(_UUIDcopy);
        let _path = path.join(__dirname, "..", "..", "temp", _UUIDcopy + ".png");
        fs.unlink(_path, (err) => {
            //ignore this
        });
    }, EXPIRETIME)
    renderingUUID = "";
    renderedTaskCounter++;
}

function updateRenderingTask(proc_output: Buffer) {
    let _task: RenderStat = taskList.get(renderingUUID) as RenderStat;
    _task.currentIter++;
    _task.status = "Rendering";
    let _output = proc_output.toString();
    taskList.set(renderingUUID, _task);
}

function concatArg(req: RenderStat): string {
    let _arg = `--scale ${req.origReq.scale} --steps ${req.origReq.steps} --height ${req.origReq.height} --width ${req.origReq.width} --seed ${req.origReq.seed} --outname ${req.uuid} ${req.origReq.prompt} `;
    if (req.origReq.watermark) {
        _arg += `--watermark ${conf.render.watermark.text} `
    }
    if (req.origReq.negPrompt !== "") {
        _arg += `--negative ${req.origReq.negPrompt} `
    }
    _arg += os.EOL;
    return _arg;
}

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
    if ((req.seed > 0xffff_ffff_ffff_f) || (req.seed < -0xffff_ffff_ffff_f)) {
        return "Seed out of range"
    }
    return "";
}
