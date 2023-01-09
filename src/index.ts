const express = require("express");
const path = require('path');
const cp = require('child_process');

const PYSCRIPT_PATH = path.join(__dirname, "..", "src", "pytorch.py");
const PORT = 80;

const daemon = cp.spawn("python", [PYSCRIPT_PATH, "--listen"]);

daemon.stdout.on('data', (data: Buffer) => {
  console.log(`stdout: ${data}`);
  console.log(data.toString() === "ready\r\n", data)
  if(data.toString() === "ready\r\n"){
    daemon.stdin.write("cool ((((solo)))) ((male)) (((pegasus))) with (white skin dark blue short mane cyan iris) wearing sunglasses looking at you smiling highly detailed portrait realistic illustration high resolution {profile pic} awesome {{Unreal Engine 8K}} --noopt --seed 127 --outname test --sampler euler\r\n");
  }
});

daemon.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

daemon.on('close', (code) => {
  console.log(`child process exited with code ${code}`, "Server halt on fatal error");
  process.exit(code);
});

const app = express();

app.use("/", express.static(path.join(__dirname, "..", "frontend", "dist")));

app.listen(PORT, () => {
    console.log(`Hey yo im on http://127.0.0.1:${PORT}!`);
});